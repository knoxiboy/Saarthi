import { integer, pgTable, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
});

export const chatHistoryTable = pgTable("chat_history", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    chatId: varchar({ length: 255 }).notNull(),
    chatTitle: varchar({ length: 255 }),
    userEmail: varchar({ length: 255 }).notNull(),
    role: varchar({ length: 20 }).notNull(),
    content: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
});

export const roadmapsTable = pgTable("roadmaps", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userEmail: varchar({ length: 255 }).notNull(),
    targetField: varchar({ length: 255 }).notNull(),
    roadmapData: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
});

export const coverLettersTable = pgTable("cover_letters", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userEmail: varchar({ length: 255 }).notNull(),
    jobDescription: text().notNull(),
    userDetails: text().notNull(),
    coverLetter: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
});

export const resumeAnalysisTable = pgTable("resume_analysis", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userEmail: varchar({ length: 255 }).notNull(),
    resumeText: text().notNull(),
    jobDescription: text(),
    analysisData: text().notNull(),
    resumeName: varchar({ length: 255 }),
    createdAt: timestamp().defaultNow().notNull(),
});

export const sharedChatsTable = pgTable("shared_chats", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    chatId: varchar({ length: 255 }).notNull().unique(),
    createdAt: timestamp().defaultNow().notNull(),
});

export const resumesTable = pgTable("resumes", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userEmail: varchar({ length: 255 }).notNull(),
    resumeName: varchar({ length: 255 }).notNull(),
    resumeData: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
});

export const coursesTable = pgTable("courses", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userEmail: varchar({ length: 255 }).notNull(),
    roadmapId: integer(),
    milestoneId: integer(),
    title: varchar({ length: 255 }).notNull(),
    level: varchar({ length: 50 }), // Beginner, Intermediate, Advanced
    duration: varchar({ length: 100 }), // e.g., "8 weeks"
    goalType: varchar({ length: 100 }), // Interview Prep, Mastery, etc.
    description: text(),
    outcomes: text(), // JSON string
    capstoneProject: text(),
    estimatedHours: integer(),
    generationStatus: varchar({ length: 50 }).default("pending"), // pending, generating, completed, failed
    content: text().notNull(), // Compatibility for old structure
    createdAt: timestamp().defaultNow().notNull(),
});

export const courseModulesTable = pgTable("course_modules", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    courseId: integer().references(() => coursesTable.id),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    order: integer().notNull(),
    estimatedHours: integer(),
});

export const courseLessonsTable = pgTable("course_lessons", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    moduleId: integer().references(() => courseModulesTable.id),
    title: varchar({ length: 255 }).notNull(),
    depthLevel: varchar({ length: 50 }),
    explanation: text(), // 800+ words
    realWorldExample: text(),
    codeExample: text(),
    commonMistakes: text(), // JSON string
    exercise: text(),
    interviewQuestions: text(), // JSON string
    content: text().notNull(), // Compatibility for raw content
    takeaways: text().notNull(), // Compatibility
    summary: text(),
    quiz: text(),
    videoUrl: text(),
    videoTitle: text(),
    order: integer().notNull(),
});

export const courseProgressTable = pgTable("course_progress", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userEmail: varchar({ length: 255 }).notNull(),
    lessonId: integer().references(() => courseLessonsTable.id),
    completed: boolean().default(false).notNull(),
    quizScore: integer(),
    updatedAt: timestamp().defaultNow().notNull(),
});

// Relations
export const coursesRelations = relations(coursesTable, ({ many }) => ({
    modules: many(courseModulesTable),
}));

export const courseModulesRelations = relations(courseModulesTable, ({ one, many }) => ({
    course: one(coursesTable, {
        fields: [courseModulesTable.courseId],
        references: [coursesTable.id],
    }),
    lessons: many(courseLessonsTable),
}));

export const courseLessonsRelations = relations(courseLessonsTable, ({ one, many }) => ({
    module: one(courseModulesTable, {
        fields: [courseLessonsTable.moduleId],
        references: [courseModulesTable.id],
    }),
    progress: many(courseProgressTable),
}));

export const courseProgressRelations = relations(courseProgressTable, ({ one }) => ({
    lesson: one(courseLessonsTable, {
        fields: [courseProgressTable.lessonId],
        references: [courseLessonsTable.id],
    }),
}));
