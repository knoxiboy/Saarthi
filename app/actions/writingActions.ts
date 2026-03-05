"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db/db"
import { writingStudioTable } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getWritingHistoryAction(docType: string) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return { success: false, error: "Unauthorized" };
        }

        const history = await db.select()
            .from(writingStudioTable)
            .where(
                and(
                    eq(writingStudioTable.userEmail, userEmail),
                    eq(writingStudioTable.docType, docType)
                )
            )
            .orderBy(desc(writingStudioTable.createdAt));

        return { success: true, data: history };
    } catch (error: any) {
        console.error("GET WRITING HISTORY ACTION ERROR:", error);
        return { success: false, error: error.message || "Failed to fetch writing history" };
    }
}

export async function getWritingItemAction(id: number) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return { success: false, error: "Unauthorized" };
        }

        const [item] = await db.select()
            .from(writingStudioTable)
            .where(
                and(
                    eq(writingStudioTable.id, id),
                    eq(writingStudioTable.userEmail, userEmail)
                )
            )
            .limit(1);

        if (!item) {
            return { success: false, error: "Document not found" };
        }

        return { success: true, data: item };
    } catch (error: any) {
        console.error("GET WRITING ITEM ACTION ERROR:", error);
        return { success: false, error: error.message || "Failed to fetch document" };
    }
}

export async function deleteWritingItemAction(id: number) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return { success: false, error: "Unauthorized" };
        }

        await db.delete(writingStudioTable)
            .where(
                and(
                    eq(writingStudioTable.id, id),
                    eq(writingStudioTable.userEmail, userEmail)
                )
            );

        revalidatePath("/ai-tools/writing-studio");
        return { success: true };
    } catch (error: any) {
        console.error("DELETE WRITING ITEM ACTION ERROR:", error);
        return { success: false, error: error.message || "Failed to delete document" };
    }
}
