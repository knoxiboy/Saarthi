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
        const safeTopic = topic?.trim() || "Technology Masterclass";
        const safeLevel = level?.trim() || "Intermediate";
        const safeDuration = duration?.trim() || "4 Weeks";
        const safeGoal = goalType?.trim() || "Mastery";

        // 0. Caching Check
        // Note: For simplicity, we check if a course with similar title/level/user exists.
        // A full hash-based cache could be implemented in a 'course_cache' table if needed.

        // 1. Generate Course Outline using Llama 3.3 70B
        console.log(`[COURSE_ACTION] Generating outline for: ${safeTopic} (${safeLevel})`);
        const outline = await generateCourseOutline(safeTopic, safeLevel, safeDuration, safeGoal);

        // 2. Insert Parent Course (Status: generating)
        const [insertedCourse] = await db.insert(coursesTable).values({
            userEmail,
            title: outline.courseTitle,
            level: safeLevel,
            duration: safeDuration,
            goalType: safeGoal,
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

            for (let lIdx = 0; lIdx < m.lessons.length; lIdx++) {
                const l = m.lessons[lIdx];
                await db.insert(courseLessonsTable).values({
                    moduleId: mod.id,
                    title: l.title,
                    depthLevel: level,
                    content: l.focus, // Temporary focus as content
                    takeaways: "[]",
                    order: lIdx + 1
                });
            }
        }

        // 4. Trigger Background Generation via Inngest
        await inngest.send({
            name: "course/generate.content",
            data: { courseId }
        });

        return { success: true, courseId };

    } catch (error: unknown) {
        console.error("[COURSE_ACTION] Error in createCourseAction:", error);
        return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
    }
}

/**
 * STEP 2: Background Generation - Detailed Lesson Content
 * To be triggered by the frontend or an edge worker after redirect.
 */
export async function generateCourseContentAction(courseId: number) {
    try {
        await inngest.send({
            name: "course/generate.content",
            data: { courseId }
        });
        return { success: true };
    } catch (error: unknown) {
        console.error("[COURSE_ACTION] Inngest Trigger Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
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
