import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import {
    userProfilesTable,
    professionalLinksTable,
    userSkillsTable,
    userProjectsTable,
    careerGoalsTable,
    profileInsightsTable,
    userEducationTable,
    userExperienceTable,
    userAchievementsTable,
    roadmapsTable,
    coursesTable,
    writingStudioDocsTable,
    resumeAnalysisTable,
    resumesTable,
    chatHistoryTable
} from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";
import { chatWithGroq } from "@/lib/ai/groq";
import { MODELS } from "@/lib/ai/models";
import pdf from "pdf-parse-fork";
import { ProfileWithRelations } from "@/types";
import { getFullUserProfile } from "@/lib/db/profile";

export async function GET(req: NextRequest) {
    try {
        const clerkUser = await currentUser();
        const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profileData = await getFullUserProfile(userEmail);
        return NextResponse.json(profileData);

    } catch (error: any) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("resume") as File;

        if (!file) {
            return NextResponse.json({ error: "No resume provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfData = await pdf(buffer);
        const resumeText = pdfData.text;

        const prompt = `
        You are an elite AI Career Coach and Talent Analyzer. Extract structured data from the following resume text for a Saarthi Profile and perform a deep "Job Readiness" analysis.
        
        Resume Text:
        ${resumeText}

        Evaluation Master Formula (Weighted for Role Baseline):
        1. Skills Match Score (30%) - Core technical skills vs industry standard.
        2. Project Strength Score (20%) - Complexity and deployment status.
        3. Experience Depth Score (15%) - Impact and leadership metrics.
        4. ATS Optimization Score (15%) - Keywords and formatting effectiveness.
        5. Impact & Metrics Score (10%) - Quantifiable achievements.
        6. Industry Fit Score (10%) - General readiness for high-growth tech roles.

        Respond ONLY with a JSON object in this format:
        {
          "profile": {
            "name": "string",
            "currentRole": "string",
            "university": "string",
            "location": "string",
            "internshipsCount": number,
            "leetcodeCount": number
          },
          "links": [
            { "platform": "GitHub | LinkedIn | LeetCode | Portfolio | Blog | Kaggle | Codeforces", "url": "string" }
          ],
          "skills": [
            { "category": "Languages | Frontend | Backend | Databases | Cloud | Tools", "skillName": "string" }
          ],
          "projects": [
            {
              "title": "string",
              "techStack": "string",
              "description": "string",
              "links": { "github": "string", "live": "string", "demo": "string", "docs": "string" }
            }
          ],
          "experience": [
            { "company": "string", "role": "string", "location": "string", "startDate": "string", "endDate": "string", "description": "string" }
          ],
          "education": [
            { "institution": "string (name of school/college/univ)", "degree": "string", "fieldOfStudy": "string", "cgpa": "string", "startDate": "string", "endDate": "string", "description": "string" }
          ],
          "achievements": [
            { "title": "string", "description": "string" }
          ],
          "insights": {
            "jobReadinessScore": number (0-100),
            "atsScore": number (0-100),
            "keywordStrength": "Low | Medium | Strong",
            "projectImpact": "Weak | Medium | Strong",
            "breakdown": {
                "resumeQuality": number (0-100),
                "projectsStrength": number (0-100),
                "skillsCoverage": number (0-100),
                "experience": number (0-100)
            },
            "suggestions": ["highly actionable suggestion 1", "highly actionable suggestion 2"]
          }
        }
        `;

        const response = await chatWithGroq([
            { role: "system", content: "You are a professional resume parser." },
            { role: "user", content: prompt }
        ], {
            response_format: { type: "json_object" },
            model: MODELS.PRIMARY
        });

        const extractedData = JSON.parse(response.choices[0].message.content || "{}");
        console.log("Extracted Data:", JSON.stringify(extractedData, null, 2));

        // Prepare safe data objects with defaults
        const profile = extractedData.profile || {};
        const links = Array.isArray(extractedData.links) ? extractedData.links : [];
        const skills = Array.isArray(extractedData.skills) ? extractedData.skills : [];
        const projects = Array.isArray(extractedData.projects) ? extractedData.projects : [];
        const experience = Array.isArray(extractedData.experience) ? extractedData.experience : [];
        const education = (Array.isArray(extractedData.education) ? extractedData.education : []).map((e: {
            institution?: string;
            school?: string;
            college?: string;
            university?: string;
            degree?: string;
            fieldOfStudy?: string;
            cgpa?: string;
            startDate?: string;
            endDate?: string;
            description?: string;
        }) => ({
            institution: e.institution || e.school || e.college || e.university || "Unknown Institution",
            degree: e.degree || "Degree Not Specified",
            fieldOfStudy: e.fieldOfStudy || "",
            cgpa: e.cgpa || "",
            startDate: e.startDate || "N/A",
            endDate: e.endDate || "Present",
            description: e.description || ""
        }));

        const achievementSource = extractedData.achievements || extractedData.honors || extractedData.certifications || extractedData.awards;
        const mappedAchievements = (Array.isArray(achievementSource) ? achievementSource : []).map((a: { title?: string; name?: string; description?: string; details?: string }) => ({
            title: a.title || a.name || "Achievement",
            description: a.description || a.details || ""
        }));
        const insights = extractedData.insights || {
            jobReadinessScore: 0,
            atsScore: 0,
            keywordStrength: "Low",
            projectImpact: "Weak",
            breakdown: {
                resumeQuality: 0,
                projectsStrength: 0,
                skillsCoverage: 0,
                experience: 0
            },
            suggestions: []
        };

        // Save to Database
        await db.transaction(async (tx) => {
            // UPSERT Profile
            await tx.insert(userProfilesTable)
                .values({
                    userEmail,
                    name: profile.name || "Unknown",
                    currentRole: profile.currentRole || "N/A",
                    university: profile.university || "N/A",
                    location: profile.location || "N/A",
                    internshipsCount: profile.internshipsCount || 0,
                    leetcodeCount: profile.leetcodeCount || 0,
                    completionPercentage: 0, // Will be calculated on GET
                })
                .onConflictDoUpdate({
                    target: [userProfilesTable.userEmail],
                    set: {
                        name: profile.name || null,
                        currentRole: profile.currentRole || null,
                        university: profile.university || null,
                        location: profile.location || null,
                        internshipsCount: profile.internshipsCount || 0,
                        leetcodeCount: profile.leetcodeCount || 0,
                        updatedAt: new Date()
                    }
                });

            // Refresh Links
            await tx.delete(professionalLinksTable).where(eq(professionalLinksTable.userEmail, userEmail));
            if (links.length > 0) {
                await tx.insert(professionalLinksTable).values(
                    links.map((l: any) => ({ userEmail, ...l }))
                );
            }

            // Refresh Skills
            await tx.delete(userSkillsTable).where(eq(userSkillsTable.userEmail, userEmail));
            if (skills.length > 0) {
                await tx.insert(userSkillsTable).values(
                    skills.map((s: any) => ({ userEmail, ...s }))
                );
            }

            // Refresh Projects
            await tx.delete(userProjectsTable).where(eq(userProjectsTable.userEmail, userEmail));
            if (projects.length > 0) {
                await tx.insert(userProjectsTable).values(
                    projects.map((p: any) => ({
                        userEmail,
                        title: p.title || "Untitled Project",
                        techStack: p.techStack || "",
                        description: p.description || "",
                        links: JSON.stringify(p.links || {})
                    }))
                );
            }

            // Refresh Experience
            await tx.delete(userExperienceTable).where(eq(userExperienceTable.userEmail, userEmail));
            if (experience.length > 0) {
                await tx.insert(userExperienceTable).values(
                    experience.map((e: any) => ({ userEmail, ...e }))
                );
            }

            // Refresh Education
            await tx.delete(userEducationTable).where(eq(userEducationTable.userEmail, userEmail));
            if (education.length > 0) {
                await tx.insert(userEducationTable).values(
                    education.map((e: any) => ({ userEmail, ...e }))
                );
            }

            // Refresh Achievements
            await tx.delete(userAchievementsTable).where(eq(userAchievementsTable.userEmail, userEmail));
            if (mappedAchievements.length > 0) {
                await tx.insert(userAchievementsTable).values(
                    mappedAchievements.map((a) => ({ userEmail, ...a }))
                );
            }

            // UPSERT Insights
            await tx.insert(profileInsightsTable)
                .values({
                    userEmail,
                    jobReadinessScore: insights.jobReadinessScore || 0,
                    atsScore: insights.atsScore || 0,
                    keywordStrength: insights.keywordStrength || "Low",
                    projectImpact: insights.projectImpact || "Weak",
                    breakdown: JSON.stringify(insights.breakdown || {}),
                    suggestions: JSON.stringify(insights.suggestions || []),
                })
                .onConflictDoUpdate({
                    target: [profileInsightsTable.userEmail],
                    set: {
                        jobReadinessScore: insights.jobReadinessScore || 0,
                        atsScore: insights.atsScore || 0,
                        keywordStrength: insights.keywordStrength || "Low",
                        projectImpact: insights.projectImpact || "Weak",
                        breakdown: JSON.stringify(insights.breakdown || {}),
                        suggestions: JSON.stringify(insights.suggestions || []),
                        updatedAt: new Date()
                    }
                });
        });

        // Return the full synthesized profile matching the GET structure
        const finalProfile = {
            ...profile,
            userEmail,
            links,
            skills,
            projects: projects.map((p: { title: string; techStack: string; description: string; links?: any }) => ({
                ...p,
                links: JSON.stringify(p.links || {})
            })),
            experience,
            education,
            achievements: mappedAchievements,
            insights,
            updatedAt: new Date()
        };

        return NextResponse.json({ success: true, data: finalProfile });

    } catch (error: any) {
        console.error("Profile Extraction Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { type, data } = body;

        switch (type) {
            case "goals": {
                const { id, ...cleanData } = data;
                await db.insert(careerGoalsTable)
                    .values({ userEmail, ...cleanData })
                    .onConflictDoUpdate({
                        target: [careerGoalsTable.userEmail],
                        set: cleanData
                    });
                break;
            }
            case "profile":
                await db.update(userProfilesTable)
                    .set({ ...data, updatedAt: new Date() })
                    .where(eq(userProfilesTable.userEmail, userEmail));
                break;
            case "links":
                await db.transaction(async (tx) => {
                    await tx.delete(professionalLinksTable).where(eq(professionalLinksTable.userEmail, userEmail));
                    if (data.length > 0) {
                        const cleanData = data.map(({ id, ...rest }: any) => ({ userEmail, ...rest }));
                        await tx.insert(professionalLinksTable).values(cleanData);
                    }
                });
                break;
            case "skills":
                await db.transaction(async (tx) => {
                    await tx.delete(userSkillsTable).where(eq(userSkillsTable.userEmail, userEmail));
                    if (data.length > 0) {
                        const cleanData = data.map(({ id, ...rest }: any) => ({ userEmail, ...rest }));
                        await tx.insert(userSkillsTable).values(cleanData);
                    }
                });
                break;
            case "projects":
                await db.transaction(async (tx) => {
                    await tx.delete(userProjectsTable).where(eq(userProjectsTable.userEmail, userEmail));
                    if (data.length > 0) {
                        const cleanData = data.map(({ id, ...p }: any) => ({
                            userEmail,
                            title: p.title || "Untitled Project",
                            techStack: p.techStack || "",
                            description: p.description || "",
                            links: typeof p.links === 'string' ? p.links : JSON.stringify(p.links || {})
                        }));
                        await tx.insert(userProjectsTable).values(cleanData);
                    }
                });
                break;
            case "experience":
                await db.transaction(async (tx) => {
                    await tx.delete(userExperienceTable).where(eq(userExperienceTable.userEmail, userEmail));
                    if (data.length > 0) {
                        const cleanData = data.map(({ id, ...rest }: any) => ({ userEmail, ...rest }));
                        await tx.insert(userExperienceTable).values(cleanData);
                    }
                });
                break;
            case "education":
                await db.transaction(async (tx) => {
                    await tx.delete(userEducationTable).where(eq(userEducationTable.userEmail, userEmail));
                    if (data.length > 0) {
                        const cleanData = data.map(({ id, ...rest }: any) => ({ userEmail, ...rest }));
                        await tx.insert(userEducationTable).values(cleanData);
                    }
                });
                break;
            case "achievements":
                await db.transaction(async (tx) => {
                    await tx.delete(userAchievementsTable).where(eq(userAchievementsTable.userEmail, userEmail));
                    if (data.length > 0) {
                        const cleanData = data.map(({ id, ...rest }: any) => ({ userEmail, ...rest }));
                        await tx.insert(userAchievementsTable).values(cleanData);
                    }
                });
                break;
            case "stats":
                await db.update(userProfilesTable)
                    .set({
                        internshipsCount: parseInt(data.internshipsCount) || 0,
                        leetcodeCount: parseInt(data.leetcodeCount) || 0,
                        updatedAt: new Date()
                    })
                    .where(eq(userProfilesTable.userEmail, userEmail));
                break;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
