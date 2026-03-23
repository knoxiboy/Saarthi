"use server"

import { db } from "@/lib/db/db";
import {
    coursesTable,
    courseModulesTable,
    courseLessonsTable,
    courseProgressTable
} from "@/lib/db/schema";
import {
    generateCourseOutline,
    generateLessonContent,
    generateQuiz,
    rankYouTubeVideos
} from "@/lib/ai/bedrock";
import { searchYoutubeVideos } from "@/lib/ai/youtube";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { inngest } from "@/inngest/client";
import { z } from "zod";

const CreateCourseSchema = z.object({
    topic: z.string().min(2).max(100),
    level: z.enum(["Beginner", "Intermediate", "Advanced", "Professional"]).default("Intermediate"),
    duration: z.string().min(1).max(20).default("4 Weeks"),
    goalType: z.enum(["Mastery", "Fast-Track", "Job-Ready", "Academic"]).default("Mastery"),
    roadmapId: z.number().optional(),
    milestoneId: z.number().optional()
});

/**
 * Limit concurrency for async tasks
 */
async function promiseLimit<T, R>(items: T[], limit: number, iteratorFn: (item: T) => Promise<R>): Promise<R[]> {
    const ret: Promise<R>[] = [];
    const executing: Promise<any>[] = []; // This 'any' is acceptable for tracking the promise itself
    for (const item of items) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);
        if (limit <= items.length) {
            const e: any = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(ret);
}

/**
 * Generate a unique hash for caching
 */
function generateCourseHash(topic: string, level: string, duration: string, goalType: string) {
    return crypto.createHash("md5").update(`${topic}-${level}-${duration}-${goalType}`).digest("hex");
}

/**
 * STEP 1: Fast Generation - Outline & Skeleton
 */
export async function createCourseAction(
    topic: string,
    level: string,
    duration: string,
    goalType: string,
    roadmapId?: number,
    milestoneId?: number
) {
    const validated = CreateCourseSchema.safeParse({ topic, level, duration, goalType, roadmapId, milestoneId });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }
    const {
        topic: safeTopic,
        level: safeLevel,
        duration: safeDuration,
        goalType: safeGoal
    } = validated.data;

    console.log(">>> [DEBUG] createCourseAction CALLED <<<", { safeTopic, safeLevel, safeDuration });
    try {
        const user = await currentUser();
        if (!user || !user.primaryEmailAddress?.emailAddress) {
            throw new Error("User not authenticated");
        }
        const userEmail = user.primaryEmailAddress.emailAddress;

        // Ensure strings are safe
        const topicStr = safeTopic?.trim() || "Technology Masterclass";
        const levelStr = safeLevel?.trim() || "Intermediate";
        const durationStr = safeDuration?.trim() || "4 Weeks";
        const goalStr = safeGoal?.trim() || "Mastery";

        // 0. Caching Check
        // Note: For simplicity, we check if a course with similar title/level/user exists.
        // A full hash-based cache could be implemented in a 'course_cache' table if needed.

        // 1. Generate Course Outline using Llama 3.3 70B
        console.log(`[COURSE_ACTION] Generating outline for: ${topicStr} (${levelStr})`);
        const outline = await generateCourseOutline(topicStr, levelStr, durationStr, goalStr);

        // 2. Save Course Skeleton to DB
        console.log("[COURSE_ACTION] Saving skeleton to DB...");
        const [insertedCourse] = await db.insert(coursesTable).values({
            userEmail,
            title: outline.courseTitle,
            level: levelStr,
            duration: durationStr,
            goalType: goalStr,
            description: outline.description,
            outcomes: JSON.stringify(outline.learningOutcomes),
            capstoneProject: outline.capstoneProject,
            generationStatus: "generating",
            content: outline.description, // Compatibility
            roadmapId,
            milestoneId
        }).returning();

        const courseId = insertedCourse.id;

        // 3. Save Skeleton Modules & Lessons
        for (let mIdx = 0; mIdx < outline.modules.length; mIdx++) {
            const m = outline.modules[mIdx];
            const [mod] = await db.insert(courseModulesTable).values({
                courseId,
                title: m.title,
                description: m.description,
                order: mIdx + 1
            }).returning();

            if (m.lessons && m.lessons.length > 0) {
                const lessonsToInsert = m.lessons.map((l, lIdx) => ({
                    moduleId: mod.id,
                    title: l.title,
                    depthLevel: levelStr,
                    content: l.focus || "Content pending...",
                    takeaways: "[]",
                    order: lIdx + 1
                }));
                await db.insert(courseLessonsTable).values(lessonsToInsert);
            }
        }

        // 4. Background generation is now handled via Client-side streaming in CourseClient.tsx
        // try {
        //     await inngest.send({
        //         name: "course/generate.content",
        //         data: { courseId }
        //     });
        // } catch (inngestError) {
        //     console.error("[COURSE_ACTION] Warning: Failed to trigger Inngest. Ensure Inngest is running locally or configured:", inngestError);
        // }

        return { success: true, courseId };

    } catch (error: any) {
        console.error("[COURSE_ACTION] Error in createCourseAction:", error);
        console.error("Error code:", error.code);
        console.error("Error detail:", error.detail);
        return {
            success: false,
            error: error.message,
            code: error.code,
            detail: error.detail
        };
    }
}

export async function generateSingleLessonAction(courseId: number, lessonId: number) {
    try {
        const user = await currentUser();
        if (!user || !user.primaryEmailAddress?.emailAddress) {
            throw new Error("User not authenticated");
        }

        // Fetch course schema safely
        const course = await db.query.coursesTable.findFirst({
            where: eq(coursesTable.id, courseId),
            with: { modules: { with: { lessons: true } } }
        });

        if (!course) throw new Error("Course not found");

        const targetLesson = course.modules
            .flatMap(m => m.lessons)
            .find(l => l.id === lessonId);

        if (!targetLesson) throw new Error("Lesson not found");

        // If it's already generated (i.e. has explanation), skip and return success
        if (targetLesson.explanation) {
            return { success: true, lesson: targetLesson };
        }

        // 1. Generate Deep Content
        const content = await generateLessonContent(
            targetLesson.title,
            targetLesson.content || "",
            course.level || "Intermediate",
            course.goalType || "Mastery"
        );

        // 2. Generate Quiz
        const quiz = await generateQuiz(content.explanation);

        // 3. Smart YouTube Search
        const videoCandidates = await searchYoutubeVideos(
            targetLesson.title,
            course.title,
            course.level || "Intermediate"
        );
        const rankedVideoId = await rankYouTubeVideos(videoCandidates, course.level || "Intermediate");
        const bestVideo = videoCandidates.find(v => v.videoId === rankedVideoId) || videoCandidates[0];

        // 4. Update DB
        const [updatedLesson] = await db.update(courseLessonsTable).set({
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
        }).where(eq(courseLessonsTable.id, lessonId)).returning();

        return { success: true, lesson: updatedLesson };
    } catch (error: any) {
        console.error("[COURSE_ACTION] Generate Lesson Error:", error);
        return { success: false, error: error.message || "Failed to generate lesson content" };
    }
}

export async function getCourseDetails(courseId: number) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        const course = await db.query.coursesTable.findFirst({
            where: eq(coursesTable.id, courseId),
            with: {
                modules: {
                    with: {
                        lessons: {
                            orderBy: (lessons, { asc }) => [asc(lessons.order)]
                        }
                    },
                    orderBy: (modules, { asc }) => [asc(modules.order)]
                }
            }
        });

        if (!course) return null;

        // Fetch progress for this user
        if (userEmail) {
            const progress = await db.query.courseProgressTable.findMany({
                where: eq(courseProgressTable.userEmail, userEmail)
            });

            // Map progress to lessons
            const progressMap = new Map(progress.map(p => [p.lessonId, p.completed]));

            return {
                ...course,
                modules: course.modules.map(m => ({
                    ...m,
                    lessons: m.lessons.map(l => ({
                        ...l,
                        isCompleted: progressMap.get(l.id) || false
                    }))
                }))
            };
        }

        return course;
    } catch (error) {
        console.error("GET COURSE DETAILS ERROR:", error);
        return null;
    }
}

export async function updateLessonProgress(lessonId: number, completed: boolean, quizScore?: number) {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");
        const userEmail = user.primaryEmailAddress?.emailAddress;
        if (!userEmail) throw new Error("Email not found");

        const existing = await db.query.courseProgressTable.findFirst({
            where: and(
                eq(courseProgressTable.userEmail, userEmail),
                eq(courseProgressTable.lessonId, lessonId)
            )
        });

        if (existing) {
            await db.update(courseProgressTable).set({
                completed,
                quizScore: quizScore !== undefined ? quizScore : existing.quizScore,
                updatedAt: new Date()
            }).where(eq(courseProgressTable.id, existing.id));
        } else {
            await db.insert(courseProgressTable).values({
                userEmail,
                lessonId,
                completed,
                quizScore: quizScore || 0
            });
        }
        return { success: true };
    } catch (error) {
        console.error("Update Progress Error:", error);
        return { success: false };
    }
}
