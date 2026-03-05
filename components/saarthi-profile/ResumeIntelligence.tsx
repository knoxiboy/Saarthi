"use client"

import { Sparkles, CheckCircle2, AlertCircle, BarChart3, Target, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface ResumeIntelligenceProps {
    insights: {
        atsScore: number
        keywordStrength: string
        projectImpact: string
        breakdown?: string // JSON string
    } | null
    onUpdateResume: () => void
}

export default function ResumeIntelligence({ insights, onUpdateResume }: ResumeIntelligenceProps) {
    if (!insights) return null;

    const stats = [
        { label: "ATS Score", value: insights.atsScore + "/100", icon: Target, color: "text-blue-400" },
    ]

    const scoreBreakdown = typeof insights.breakdown === 'string' ? JSON.parse(insights.breakdown) : (insights.breakdown || {})

    return (
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">Resume Intelligence</h2>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI-powered analysis of your current profile</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onUpdateResume}
                            className="px-4 py-2 bg-blue-600 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                        >
                            Update Resume
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors group">
                            <stat.icon className={`w-6 h-6 ${stat.color} mb-4 group-hover:scale-110 transition-transform`} />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-xl font-black text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Score Breakdown Bars */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Deep Breakdown</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {Object.entries(scoreBreakdown).map(([key, value], i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="text-white">{value as number}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${value}%` }}
                                        className="h-full bg-blue-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
