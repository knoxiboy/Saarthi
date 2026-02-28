import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
});

export const chatHistoryTable = pgTable("chat_history", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    chatId: varchar({ length: 255 }).notNull(), // Unique ID for each session
    chatTitle: varchar({ length: 255 }), // Optional title for the block
    userEmail: varchar({ length: 255 }).notNull(),
    role: varchar({ length: 20 }).notNull(),
    content: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
});

export const roadmapsTable = pgTable("roadmaps", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userEmail: varchar({ length: 255 }).notNull(),
    targetField: varchar({ length: 255 }).notNull(),
    roadmapData: text().notNull(), // Store JSON as string
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
    analysisData: text().notNull(), // Store JSON string
    resumeName: varchar({ length: 255 }), // Name of the uploaded file
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
    resumeData: text().notNull(), // Store full JSON data
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
});

export const writingStudioDocsTable = pgTable("writing_studio_docs", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userEmail: varchar({ length: 255 }).notNull(),
    docType: varchar({ length: 50 }).notNull(), // e.g., 'cover_letter', 'sop', 'motivation_letter', 'proposal'
    context: text().notNull(), // Job Description, Company context, etc.
    userDetails: text().notNull(), // Experience, achievements, summary
    generatedContent: text().notNull(), // The final output
    createdAt: timestamp().defaultNow().notNull(),
});

export const coursesTable = pgTable("courses", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userEmail: varchar({ length: 255 }).notNull(),
    roadmapId: integer(), // Optional: link to a specific roadmap
    milestoneId: integer(), // Optional: link to a specific milestone index or ID
    title: varchar({ length: 255 }).notNull(),
    content: text().notNull(), // Store JSON string with text and video links (Old version)
    createdAt: timestamp().defaultNow().notNull(),
});

export const courseModulesTable = pgTable("course_modules", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    courseId: integer().references(() => coursesTable.id),
    title: varchar({ length: 255 }).notNull(),
    order: integer().notNull(),
});

export const courseLessonsTable = pgTable("course_lessons", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    moduleId: integer().references(() => courseModulesTable.id),
    title: varchar({ length: 255 }).notNull(),
    content: text().notNull(),
    takeaways: text().notNull(), // Store JSON string
    summary: text(), // Added for module/lesson summary
    quiz: text(), // Added for module/lesson quiz
    videoUrl: text(),
    order: integer().notNull(),
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

export const courseLessonsRelations = relations(courseLessonsTable, ({ one }) => ({
    module: one(courseModulesTable, {
        fields: [courseLessonsTable.moduleId],
        references: [courseModulesTable.id],
    }),
}));
