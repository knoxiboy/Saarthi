"use client"

import { ResumeData } from "@/types"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2, Info, Lightbulb, Zap } from "lucide-react"
import { useMemo } from "react"

interface ATSDiagnosticsProps {
    data: ResumeData;
}

export default function ATSDiagnostics({ data }: ATSDiagnosticsProps) {
    const analysis = useMemo(() => {
        let score = 0;
        const issues: { type: 'error' | 'warning' | 'success', message: string, suggestion: string }[] = [];

        // 1. Personal Info
        if (data.personalInfo.email && data.personalInfo.phone) {
            score += 15;
            issues.push({ type: 'success', message: 'Core Contact Info', suggestion: 'Email and phone are present.' });
        } else {
            issues.push({ type: 'error', message: 'Missing Contact Details', suggestion: 'Add both phone and professional email.' });
        }

        if (data.personalInfo.linkedin) {
            score += 5;
        } else {
            issues.push({ type: 'warning', message: 'No LinkedIn Profile', suggestion: 'LinkedIn is essential for modern recruiters.' });
        }

        // 2. Summary
        if (data.personalInfo.summary && data.personalInfo.summary.length > 50) {
            score += 10;
        } else {
            issues.push({ type: 'warning', message: 'Weak Professional Summary', suggestion: 'Write a compelling 2-3 sentence overview.' });
        }

        // 3. Experience
        if (data.experience.length >= 2) {
            score += 25;
            const hasGoodDescriptions = data.experience.every(exp => exp.description.length > 100);
            if (!hasGoodDescriptions) {
                issues.push({ type: 'warning', message: 'Thin Job Descriptions', suggestion: 'Focus on impact and quantifiable results.' });
            }
        } else {
            issues.push({ type: 'error', message: 'Work History Needed', suggestion: 'Add at least 2 roles or internships.' });
        }

        // 4. Skills
        const totalSkills = data.skills.reduce((acc, s) => acc + s.skills.length, 0);
        if (totalSkills >= 8) {
            score += 20;
        } else {
            issues.push({ type: 'warning', message: 'Low Skill Density', suggestion: 'List at least 8-10 relevant technical skills.' });
        }

        // 5. Projects & Education
        if (data.projects.length > 0) score += 15;
        if (data.education.length > 0) score += 10;

        return { score: Math.min(score, 100), issues };
    }, [data]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-4xl p-8 backdrop-blur-3xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">ATS Audit</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Live Diagnostic Diagnostics</p>
                </div>
                <div className="relative w-20 h-20">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                            className="text-white/5"
                            strokeDasharray="100, 100"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <motion.path
                            initial={{ strokeDasharray: "0, 100" }}
                            animate={{ strokeDasharray: `${analysis.score}, 100` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`${analysis.score > 70 ? 'text-green-500' : analysis.score > 40 ? 'text-yellow-500' : 'text-red-500'}`}
                            strokeWidth="3"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black text-white">{analysis.score}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {analysis.issues.map((issue, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={idx}
                        className={`p-5 rounded-3xl border ${issue.type === 'error' ? 'bg-red-500/5 border-red-500/10' :
                                issue.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/10' :
                                    'bg-green-500/5 border-green-500/10'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {issue.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500 mt-1" /> :
                                issue.type === 'warning' ? <Zap className="w-5 h-5 text-yellow-500 mt-1" /> :
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />}
                            <div>
                                <h4 className={`text-xs font-black uppercase tracking-tight mb-1 ${issue.type === 'error' ? 'text-red-400' :
                                        issue.type === 'warning' ? 'text-yellow-400' :
                                            'text-green-400'
                                    }`}>
                                    {issue.message}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                    {issue.suggestion}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <button className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">
                    Generate AI Improvements
                </button>
            </div>
        </div>
    )
}
