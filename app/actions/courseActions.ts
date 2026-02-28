"use server"

import { db } from "@/configs/db";
import {
    coursesTable,
    courseModulesTable,
    courseLessonsTable
} from "@/configs/schema";
import { generateCourseOutline, generateQuiz } from "@/lib/bedrock";
import { searchYoutubeVideos } from "@/lib/youtube";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function createCourseAction(topic: string, context?: string, roadmapId?: number, milestoneId?: number) {
    try {
        const user = await currentUser();
        if (!user || !user.primaryEmailAddress?.emailAddress) {
            throw new Error("User not authenticated");
        }
        const userEmail = user.primaryEmailAddress.emailAddress;

        // 1. Generate Course Outline
        console.log(`[COURSE_ACTION] Generating outline for: ${topic}`);
        const aiOutput = await generateCourseOutline(topic, context);
        console.log(`[COURSE_ACTION] AI Outline received: ${aiOutput.title} with ${aiOutput.modules?.length} modules`);

        if (!aiOutput.modules || aiOutput.modules.length === 0) {
            throw new Error("AI failed to generate any modules for this topic.");
        }

        // 2. Insert Parent Course
        console.log(`[COURSE_ACTION] Inserting course into DB...`);
        const [insertedCourse] = await db.insert(coursesTable).values({
            userEmail: userEmail,
            title: aiOutput.title || topic,
            content: aiOutput.description || "",
            roadmapId: roadmapId,
            milestoneId: milestoneId
        }).returning();

        if (!insertedCourse) {
            throw new Error("Failed to save course to database.");
        }

        const courseId = insertedCourse.id;
        console.log(`[COURSE_ACTION] Course created with ID: ${courseId}`);

        // 3. Process Modules and Lessons
        for (let mIdx = 0; mIdx < aiOutput.modules.length; mIdx++) {
            const moduleData = aiOutput.modules[mIdx];
            console.log(`[COURSE_ACTION] Processing Module ${mIdx + 1}: ${moduleData.title}`);
            const [insertedModule] = await db.insert(courseModulesTable).values({
                courseId: courseId,
                title: moduleData.title,
                order: moduleData.order || mIdx + 1
            }).returning();

            if (!insertedModule) continue;

            for (let lIdx = 0; lIdx < moduleData.lessons.length; lIdx++) {
                const lessonData = moduleData.lessons[lIdx];

                // 4. Fetch YouTube Videos
                console.log(`[COURSE_ACTION] Searching videos for lesson: ${lessonData.title}`);
                const videos = await searchYoutubeVideos(`${aiOutput.title} ${lessonData.title}`);
                const videoUrl = videos[0]?.videoId ? `https://www.youtube.com/watch?v=${videos[0].videoId}` : null;

                // 5. Generate Quizzes and Summary for each lesson
                let quizContent = "";
                let summaryContent = "";
                try {
                    console.log(`[COURSE_ACTION] Generating quiz for lesson: ${lessonData.title}`);
                    const quiz = await generateQuiz(lessonData.content);
                    quizContent = JSON.stringify(quiz);
                    summaryContent = lessonData.content.substring(0, 250) + "...";
                } catch (qErr) {
                    console.error("[COURSE_ACTION] Quiz generation failed, continuing:", qErr);
                }

                await db.insert(courseLessonsTable).values({
                    moduleId: insertedModule.id,
                    title: lessonData.title,
                    content: lessonData.content,
                    takeaways: JSON.stringify(lessonData.takeaways || []),
                    summary: summaryContent,
                    quiz: quizContent,
                    videoUrl: videoUrl,
                    order: lessonData.order || lIdx + 1
                });
            }
        }

        console.log(`[COURSE_ACTION] Course generation complete for ID: ${courseId}`);
        return { success: true, courseId };

    } catch (error: any) {
        console.error("[COURSE_ACTION] ERROR:", error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred during course generation."
        };
    }
}

export async function getCourseDetails(courseId: number) {
    try {
        const course = await db.query.coursesTable.findFirst({
            where: eq(coursesTable.id, courseId),
            with: {
                modules: {
                    with: {
                        lessons: true
                    }
                }
            }
        });

        return course;
    } catch (error) {
        console.error("GET COURSE DETAILS ERROR:", error);
        return null;
    }
}
