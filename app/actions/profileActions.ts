"use server"

import { db } from "@/lib/db/db";
import {
    userProfilesTable,
    professionalLinksTable,
    userSkillsTable,
    userProjectsTable,
    userEducationTable,
    userExperienceTable,
    userAchievementsTable,
    careerGoalsTable,
    profileInsightsTable
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ExperienceSchema = z.array(z.object({
    company: z.string().min(1),
    role: z.string().min(1),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional()
}));

const EducationSchema = z.array(z.object({
    institution: z.string().min(1),
    degree: z.string().min(1),
    fieldOfStudy: z.string().optional(),
    cgpa: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional()
}));

const SkillSchema = z.array(z.object({
    skillName: z.string().min(1),
    category: z.string().optional()
}));

const ProjectSchema = z.array(z.object({
    title: z.string().min(1),
    techStack: z.string().optional(),
    description: z.string().optional(),
    links: z.string().optional()
}));

const LinkSchema = z.array(z.object({
    platform: z.string().min(1),
    url: z.string().url()
}));

const GoalSchema = z.object({
    targetRole: z.string().optional(),
    industry: z.string().optional(),
    desiredSalary: z.string().optional(),
    locationPreference: z.string().optional()
});

export async function getUserProfileAction() {
    try {
        const user = await currentUser();
        if (!user || !user.primaryEmailAddress?.emailAddress) {
            throw new Error("User not authenticated");
        }
        const userEmail = user.primaryEmailAddress.emailAddress;

        const profile = await db.query.userProfilesTable.findFirst({
            where: eq(userProfilesTable.userEmail, userEmail),
            with: {
                links: true,
                skills: true,
                projects: true,
                education: true,
                experience: true,
                achievements: true,
                goals: true,
                insights: true
            }
        });

        return { success: true, data: profile };
    } catch (error: unknown) {
        console.error("GET_PROFILE_ACTION_ERROR:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to fetch profile" };
    }
}

export async function updateProfileAction(type: string, data: any) {
    try {
        const user = await currentUser();
        if (!user || !user.primaryEmailAddress?.emailAddress) {
            throw new Error("User not authenticated");
        }
        const userEmail = user.primaryEmailAddress.emailAddress;

        switch (type) {
            case "experience":
                const validatedExp = ExperienceSchema.parse(data);
                await db.delete(userExperienceTable).where(eq(userExperienceTable.userEmail, userEmail));
                if (validatedExp.length > 0) {
                    await db.insert(userExperienceTable).values(validatedExp.map((item: any) => ({
                        userEmail,
                        ...item
                    })));
                }
                break;
            case "education":
                const validatedEdu = EducationSchema.parse(data);
                await db.delete(userEducationTable).where(eq(userEducationTable.userEmail, userEmail));
                if (validatedEdu.length > 0) {
                    await db.insert(userEducationTable).values(validatedEdu.map((item: any) => ({
                        userEmail,
                        ...item
                    })));
                }
                break;
            case "skills":
                const validatedSkills = SkillSchema.parse(data);
                await db.delete(userSkillsTable).where(eq(userSkillsTable.userEmail, userEmail));
                if (validatedSkills.length > 0) {
                    await db.insert(userSkillsTable).values(validatedSkills.map((item: any) => ({
                        userEmail,
                        ...item
                    })));
                }
                break;
            case "projects":
                const validatedProjects = ProjectSchema.parse(data);
                await db.delete(userProjectsTable).where(eq(userProjectsTable.userEmail, userEmail));
                if (validatedProjects.length > 0) {
                    await db.insert(userProjectsTable).values(validatedProjects.map((item: any) => ({
                        userEmail,
                        ...item
                    })));
                }
                break;
            case "links":
                const validatedLinks = LinkSchema.parse(data);
                await db.delete(professionalLinksTable).where(eq(professionalLinksTable.userEmail, userEmail));
                if (validatedLinks.length > 0) {
                    await db.insert(professionalLinksTable).values(validatedLinks.map((item: any) => ({
                        userEmail,
                        ...item
                    })));
                }
                break;
            case "goals":
                const validatedGoals = GoalSchema.parse(data);
                const existingGoals = await db.query.careerGoalsTable.findFirst({
                    where: eq(careerGoalsTable.userEmail, userEmail)
                });
                if (existingGoals) {
                    await db.update(careerGoalsTable).set(validatedGoals).where(eq(careerGoalsTable.userEmail, userEmail));
                } else {
                    await db.insert(careerGoalsTable).values({ userEmail, ...validatedGoals });
                }
                break;
            case "header":
                await db.update(userProfilesTable).set(data).where(eq(userProfilesTable.userEmail, userEmail));
                break;
            default:
                throw new Error("Invalid profile update type");
        }

        revalidatePath("/saarthi-profile");
        return { success: true };
    } catch (error: unknown) {
        console.error("UPDATE_PROFILE_ACTION_ERROR:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update profile" };
    }
}
