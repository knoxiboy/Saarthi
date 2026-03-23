import { currentUser } from "@clerk/nextjs/server";
import RoadmapClient from "./RoadmapClient";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { Metadata } from "next";
import { getRoadmapHistoryAction } from "@/app/actions/roadmapActions";

export const metadata: Metadata = {
    title: "AI Learning Roadmap | Saarthi",
    description: "Generate a personalized learning path and roadmap for any career goal using AI.",
};

export default async function RoadmapPage() {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
        redirect("/sign-in");
    }

    // Fetch history using the server action
    const historyRes = await getRoadmapHistoryAction();
    // Flatten the nested roadmapData for the client component
    const initialHistory = (historyRes.success && historyRes.data) ? historyRes.data.map((item: any) => ({
        ...item.roadmapData,
        id: item.id,
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
        targetField: item.targetField
    })) : [];

    if (!historyRes.success) {
        console.error("ROADMAP_PAGE_HISTORY_ERROR:", historyRes.error);
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <BackButton href="/ai-tools" label="Back to Hub" />

                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <Sparkles className="w-3 h-3" />
                        AI Learning Path
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-4 uppercase">
                        Custom <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">Learning Roadmap</span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-2xl font-medium">
                        Tell us what you want to master, and we'll create a step-by-step roadmap tailored to your timeline and skill level.
                    </p>
                </div>
            </div>

            <RoadmapClient initialHistory={initialHistory as any} />
        </div>
    );
}
