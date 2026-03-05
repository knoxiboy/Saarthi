"use client"

import { Target, Clock, BarChart, Calendar, Send } from "lucide-react"

interface RoadmapFormProps {
    targetField: string;
    setTargetField: (val: string) => void;
    timeline: string;
    setTimeline: (val: string) => void;
    currentLevel: string;
    setCurrentLevel: (val: string) => void;
    weeklyCommitment: string;
    setWeeklyCommitment: (val: string) => void;
    onGenerate: () => void;
}

export default function RoadmapForm({
    targetField,
    setTargetField,
    timeline,
    setTimeline,
    currentLevel,
    setCurrentLevel,
    weeklyCommitment,
    setWeeklyCommitment,
    onGenerate
}: RoadmapFormProps) {
    return (
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-5xl p-12 text-white relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-700">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] -mr-48 -mt-48 rounded-full" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-12">
                    <div className="group space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-focus-within:text-blue-400 transition-colors flex items-center gap-2">
                            <Target className="w-3 h-3" />
                            Target Field / Career Goal
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Full Stack Engineer, Data Scientist, UX Designer"
                            value={targetField}
                            onChange={(e) => setTargetField(e.target.value)}
                            className="w-full bg-white/5 border-b-2 border-white/10 py-4 text-2xl font-black text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="group space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-focus-within:text-blue-400 transition-colors flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Preparation Timeline
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., 3 Months, 6 Weeks, 1 Year"
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            className="w-full bg-white/5 border-b-2 border-white/10 py-4 text-2xl font-black text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-12 bg-white/2 p-8 rounded-4xl border border-white/5">
                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <BarChart className="w-3 h-3" />
                            Current Expertise Level
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => setCurrentLevel(lvl)}
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentLevel === lvl ? "bg-white text-black shadow-xl scale-105" : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"}`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Weekly Time Commitment
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., 10-15 hours"
                            value={weeklyCommitment}
                            onChange={(e) => setWeeklyCommitment(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    <button
                        onClick={onGenerate}
                        className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)] flex items-center justify-center gap-3 group active:scale-[0.98]"
                    >
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Initiate AI Strategy
                    </button>
                </div>
            </div>
        </div>
    );
}
