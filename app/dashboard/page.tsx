"use client"

import { useState } from "react"
import { SignInButton, SignedIn, SignedOut, UserButton, SignOutButton } from "@clerk/nextjs"
import Sidebar from "@/components/Sidebar"
import { FileText, Map, MessageCircle, FileEdit, Menu, Lightbulb, Sparkles, ArrowRight, TrendingUp, Target, Zap, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
    return (
        <div className="p-6 lg:p-12 space-y-16 max-w-7xl mx-auto pb-32">
            {/* AI Career Coach Banner */}
            <section className="relative overflow-hidden rounded-3xl glass-card p-8 lg:p-16 text-white shadow-2xl group border-white/10">
                {/* Visual Background Elements - Animated-style Blobs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/30 blur-[150px] rounded-full -mr-64 -mt-64 animate-pulse opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full -ml-40 -mb-40 animate-pulse delay-700 opacity-40"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-12 border border-blue-500/20 backdrop-blur-md">
                        <Sparkles className="w-4 h-4" />
                        Command Center
                    </div>

                    <h2 className="text-4xl lg:text-6xl font-black mb-8 tracking-tight text-white max-w-4xl">
                        Command Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                            Career Journey.
                        </span>
                    </h2>

                    <p className="text-slate-400 text-lg lg:text-xl mb-12 leading-relaxed max-w-3xl font-medium">
                        Optimize your professional profile, track industry trends, and execute tailored learning strategies.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <Link href="/ai-tools">
                            <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-wider hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-4 group/btn text-base">
                                Launch AI Tools
                                <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Subtle Decorative Grid Overlay within card */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>
            </section>

            {/* Available AI Tools Section */}
            <section className="pt-12">
                <div className="mb-16 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">AI Tools</h2>
                        <p className="text-slate-500 font-medium mt-2 uppercase tracking-wider text-xs">Available tools for your career</p>
                    </div>
                    <Link href="/ai-tools">
                        <button className="px-6 py-3 glass hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-4 group">
                            View All Tools
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Tool Cards */}
                    {[
                        { icon: MessageCircle, title: "Career Advisor", sub: "Strategic Guidance", href: "/ai-tools/ai-chat", gradient: "from-blue-600 to-cyan-500", label: "Initialize" },
                        { icon: FileText, title: "Resume Architect", sub: "Profile Construction", href: "/ai-tools/resume-builder", gradient: "from-purple-600 to-pink-500", label: "Initialize" },
                        { icon: Map, title: "Roadmaps", sub: "Learning Pathways", href: "/ai-tools/roadmap", gradient: "from-emerald-600 to-teal-500", label: "Initialize" },
                    ].map((tool, i) => (
                        <div key={i} className="group relative glass-card rounded-3xl p-8 hover:bg-white/[0.08] transition-all duration-700 backdrop-blur-3xl flex flex-col items-center text-center hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-white/5">
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.gradient} p-0.5 mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-[0_0_40px_rgba(0,0,0,0.3)]`}>
                                <div className="w-full h-full bg-slate-950 rounded-[calc(2rem-2px)] flex items-center justify-center">
                                    <tool.icon className="w-10 h-10 text-white group-hover:scale-110 transition-all duration-700" />
                                </div>
                            </div>
                            <h3 className="font-black text-white text-2xl mb-3 tracking-tighter">{tool.title}</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-10">{tool.sub}</p>
                            <Link href={tool.href} className="w-full mt-auto">
                                <button className="w-full py-4 glass group-hover:bg-blue-600 group-hover:text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                    {tool.label}
                                </button>
                            </Link>

                            {/* Hover Decorative Glow */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
