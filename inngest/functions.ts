import { inngest } from "./client";
import { db } from "@/lib/db/db";
import { coursesTable, courseLessonsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateLessonContent, generateQuiz, rankYouTubeVideos } from "@/lib/ai/bedrock";
import { searchYoutubeVideos } from "@/lib/ai/youtube";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return { message: `Hello ${event.data.email}!` };
    },
);

export const generateCourseContent = inngest.createFunction(
    { id: "generate-course-content", retries: 2 },
    { event: "course/generate.content" },
    async ({ event, step }) => {
        const { courseId } = event.data;

        const course = await step.run("fetch-course-skeleton", async () => {
            return await db.query.coursesTable.findFirst({
                where: eq(coursesTable.id, courseId),
                with: { modules: { with: { lessons: true } } }
            });
        });

        if (!course) return { error: "Course not found" };

        const allLessons = course.modules.flatMap(m => m.lessons);

        // We process in steps for better tracking and resume-ability
        for (const lesson of allLessons) {
            await step.run(`process-lesson-${lesson.id}`, async () => {
                // 1. Generate Deep Content
                const content = await generateLessonContent(
                    lesson.title,
                    lesson.content || "",
                    course.level || "Intermediate",
                    course.goalType || "Mastery"
                );

                // 2. Generate Quiz
                const quiz = await generateQuiz(content.explanation);

                // 3. Smart YouTube Search
                const videoCandidates = await searchYoutubeVideos(lesson.title, course.title, course.level || "Intermediate");
                const rankedVideoId = await rankYouTubeVideos(videoCandidates, course.level || "Intermediate");
                const bestVideo = videoCandidates.find(v => v.videoId === rankedVideoId) || videoCandidates[0];

                // 4. Update DB
                await db.update(courseLessonsTable).set({
                    explanation: content.explanation,
                    content: content.explanation,
                    realWorldExample: content.realWorldExample,
                    codeExample: content.codeExample,
                    commonMistakes: JSON.stringify(content.commonMistakes),
                    exercise: content.exercise,
                    interviewQuestions: JSON.stringify(content.interviewQuestions),
                    quiz: JSON.stringify(quiz),
                    videoUrl: bestVideo ? `https://www.youtube.com/watch?v=${bestVideo.videoId}` : null,
                    videoTitle: bestVideo?.title || ""
                }).where(eq(courseLessonsTable.id, lesson.id));
            });
        }

        await step.run("mark-course-completed", async () => {
            await db.update(coursesTable).set({ generationStatus: "completed" }).where(eq(coursesTable.id, courseId));
        });

        return { success: true };
    }
);
