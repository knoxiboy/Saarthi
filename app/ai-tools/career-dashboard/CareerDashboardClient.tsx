"use client"

import { motion } from "framer-motion"
import {
    Target,
    ShieldCheck,
    Zap,
    TrendingUp,
    Award,
    Activity,
    ChevronRight,
    Map,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CareerDashboardClientProps {
    profileData: any;
}

export default function CareerDashboardClient({ profileData }: CareerDashboardClientProps) {
    const router = useRouter()

    const readinessScore = profileData?.insights?.jobReadinessScore || 65
    const resumeScore = profileData?.insights?.atsScore || 72
    const totalSkills = profileData?.skills?.length || 0

    const metrics = [
        { label: "Resume Health", value: `${resumeScore}%`, icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Market Alignment", value: `${readinessScore}%`, icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Skill Density", value: totalSkills, icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Course Progress", value: "Level 4", icon: Award, color: "text-orange-500", bg: "bg-orange-500/10" }
    ]

    return (
        <div className="min-h-screen bg-slate-950 p-6 lg:p-12 text-white">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push("/ai-tools")}
                            className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                                Status: Ready for Market
                            </div>
                            <h1 className="text-4xl font-black uppercase tracking-tight">Career <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-500">Readiness</span></h1>
                            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">{profileData?.userEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Main Readiness Gauge */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white/2 border border-white/5 rounded-5xl p-10 relative overflow-hidden group hover:bg-white/3 transition-all duration-700">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] -mr-40 -mt-40 rounded-full" />

                        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                            <div className="relative w-48 h-48">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="2" />
                                    <motion.circle
                                        initial={{ strokeDasharray: "0 100" }}
                                        animate={{ strokeDasharray: `${readinessScore} 100` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        cx="18" cy="18" r="16" fill="none"
                                        className="stroke-emerald-500"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeDasharray={`${readinessScore} 100`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black tracking-tighter">{readinessScore}</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <h3 className="text-2xl font-black uppercase tracking-tight">Job Readiness Index</h3>
                                <p className="text-slate-400 font-medium leading-relaxed">
                                    Your profile shows strong alignment with <span className="text-white font-bold">{profileData?.currentRole || "Target Industry"}</span>.
                                    Strategic focus on <span className="text-emerald-400 font-bold">Cloud Architecture</span> could boost your score by 12 points.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Top 15% in cohort
                                    </div>
                                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        ATS Optimized
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {metrics.map((m, i) => (
                            <div key={i} className="bg-white/2 border border-white/5 rounded-4xl p-6 flex flex-col justify-between hover:bg-white/5 transition-all">
                                <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center`}>
                                    <m.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
                                    <p className="text-2xl font-black tracking-tight">{m.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/2 border border-white/5 rounded-5xl p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                <h3 className="text-xl font-black uppercase tracking-tight">Skill Heatmap</h3>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {profileData?.skills?.map((s: any, i: number) => (
                                <div key={i} className="px-5 py-3 bg-white/5 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all hover:bg-blue-500/5 group cursor-default">
                                    <span className="text-xs font-bold text-slate-300 group-hover:text-blue-400 transition-colors uppercase tracking-wider">{s.skillName}</span>
                                </div>
                            ))}
                        </div>
                        {(!profileData?.skills || profileData.skills.length === 0) && (
                            <p className="text-slate-500 font-medium italic text-sm">No skills identified yet. Analyze your resume to synchronize.</p>
                        )}
                    </div>

                    <div className="bg-white/2 border border-white/5 rounded-5xl p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-purple-500" />
                                <h3 className="text-xl font-black uppercase tracking-tight">Growth Map</h3>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Expand Map</button>
                        </div>
                        <div className="space-y-6">
                            {[
                                { title: "Roadmap to DevOps Engineer", date: "2 days ago", icon: Map },
                                { title: "Professional Resume v2.0", date: "Yesterday", icon: Award },
                                { title: "Career Consultation", date: "4 hours ago", icon: Activity }
                            ].map((act, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-3xl transition-all border border-transparent hover:border-white/5 group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-all">
                                            <act.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-200 group-hover:text-white">{act.title}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{act.date}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Calls to Action */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                    <Link href="/ai-tools/resume-builder" className="group">
                        <div className="h-full bg-linear-to-br from-blue-600 to-indigo-700 p-8 rounded-4xl relative overflow-hidden">
                            <h4 className="text-xl font-black uppercase tracking-tight mb-2">Enhance Resume</h4>
                            <p className="text-blue-100 text-xs font-medium mb-6">Boost your ATS score by 15 pts.</p>
                            <ChevronRight className="w-6 h-6 absolute right-8 bottom-8 opacity-50 group-hover:translate-x-2 transition-all" />
                        </div>
                    </Link>
                    <Link href="/ai-tools/roadmap" className="group">
                        <div className="h-full bg-linear-to-br from-purple-600 to-pink-700 p-8 rounded-4xl relative overflow-hidden">
                            <h4 className="text-xl font-black uppercase tracking-tight mb-2">New Roadmap</h4>
                            <p className="text-purple-100 text-xs font-medium mb-6">Explore another career field.</p>
                            <ChevronRight className="w-6 h-6 absolute right-8 bottom-8 opacity-50 group-hover:translate-x-2 transition-all" />
                        </div>
                    </Link>
                    <Link href="/ai-tools/ai-chat" className="group">
                        <div className="h-full bg-linear-to-br from-emerald-600 to-teal-700 p-8 rounded-4xl relative overflow-hidden">
                            <h4 className="text-xl font-black uppercase tracking-tight mb-2">Expert Advice</h4>
                            <p className="text-emerald-100 text-xs font-medium mb-6">Live AI career strategy.</p>
                            <ChevronRight className="w-6 h-6 absolute right-8 bottom-8 opacity-50 group-hover:translate-x-2 transition-all" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
