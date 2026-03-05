"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ArrowRight, UserCircle } from "lucide-react"
import Link from "next/link"

import Onboarding from "@/components/saarthi-profile/Onboarding"
import ProfileHeader from "@/components/saarthi-profile/ProfileHeader"
import ResumeIntelligence from "@/components/saarthi-profile/ResumeIntelligence"
import ProfessionalLinks from "@/components/saarthi-profile/ProfessionalLinks"
import SkillsAndProjects from "@/components/saarthi-profile/SkillsAndProjects"
import CareerGoals from "@/components/saarthi-profile/CareerGoals"
import AIInsights from "@/components/saarthi-profile/AIInsights"
import CareerJourney from "@/components/saarthi-profile/CareerJourney"

export default function SaarthiProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true)
        try {
            const response = await axios.get(`/api/profile?t=${Date.now()}`)
            setProfile(response.data)
        } catch (error) {
            console.error("Failed to fetch profile:", error)
        } finally {
            if (!isRefresh) setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProfile()

        // Auto-refresh when window gains focus (e.g., coming back from another tool)
        const handleFocus = () => {
            fetchProfile(true)
        }

        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [fetchProfile])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading Saarthi Experience...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
                <AnimatePresence mode="wait">
                    {!profile ? (
                        <motion.div
                            key="onboarding"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Onboarding onComplete={setProfile} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Dashboard Header */}
                            <div className="flex items-center justify-between gap-4 mb-12">
                                <div>
                                    <h1 className="text-4xl font-black text-white uppercase tracking-tight">
                                        Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Center</span>
                                    </h1>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Your Personal Career Intel</p>
                                        <div className="h-1 w-1 bg-slate-700 rounded-full" />
                                        <p className="text-slate-600 font-bold uppercase tracking-widest text-[9px]">
                                            Last Synced: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : 'Just Now'}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard/profile/account"
                                    className="flex items-center gap-2 px-4 md:px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all group shrink-0"
                                >
                                    <UserCircle className="w-4 h-4" />
                                    Account Settings
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {/* Section 1: Header */}
                                <ProfileHeader data={profile} onUpdate={fetchProfile} />

                                {/* Section 2: Resume Intelligence */}
                                <ResumeIntelligence
                                    insights={profile.insights}
                                    onUpdateResume={() => setProfile(null)}
                                />

                                {/* Section 3: Professional Links */}
                                <ProfessionalLinks links={profile.links} onUpdate={fetchProfile} />

                                {/* Section 4: Career Journey */}
                                <CareerJourney
                                    experience={profile.experience}
                                    education={profile.education}
                                    achievements={profile.achievements}
                                    onUpdate={fetchProfile}
                                />

                                {/* Section 5: Skills & Projects */}
                                <SkillsAndProjects
                                    skills={profile.skills}
                                    projects={profile.projects}
                                    onUpdate={fetchProfile}
                                />

                                {/* Section 6: Career Goals */}
                                <CareerGoals goals={profile.goals} onUpdate={fetchProfile} />

                                {/* Section 7: AI Insights */}
                                <AIInsights insights={profile.insights} metrics={profile.metrics} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
