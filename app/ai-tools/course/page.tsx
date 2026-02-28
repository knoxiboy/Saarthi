"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
    BookOpen,
    Sparkles,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    Youtube,
    ExternalLink,
    PlayCircle,
    BrainCircuit,
    ChevronRight,
    Trophy
} from "lucide-react"
import axios from "axios"
import Link from "next/link"
import { toast } from "sonner"
import { RoadmapSkeleton } from "@/components/ToolSkeletons"

interface Section {
    heading: string
    content: string
    keyTakeaways: string[]
    videoSearchQuery: string
}

interface Resource {
    name: string
    type: string
    link: string
}

interface QuizItem {
    question: string
    options: string[]
    correctAnswer: string
}

interface CourseData {
    title: string
    description: string
    sections: Section[]
    studyResources: Resource[]
    quiz: QuizItem[]
}

import { createCourseAction, getCourseDetails } from "@/app/actions/courseActions"

interface Lesson {
    id: number
    title: string
    content: string
    takeaways: string // JSON string
    videoUrl: string | null
    order: number
}

interface Module {
    id: number
    title: string
    order: number
    lessons: Lesson[]
}

interface CourseData {
    id: number
    title: string
    content: string // Description
    modules: Module[]
}

function CourseContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const courseId = searchParams.get("id")
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [course, setCourse] = useState<CourseData | null>(null)
    const [activeModule, setActiveModule] = useState(0)
    const [activeLesson, setActiveLesson] = useState(0)
    const [directTopic, setDirectTopic] = useState("")

    useEffect(() => {
        if (!courseId) {
            setLoading(false)
            return
        }

        const fetchCourse = async () => {
            setLoading(true)
            try {
                const data = await getCourseDetails(Number(courseId))
                if (data) {
                    setCourse(data as any)
                }
            } catch (err) {
                console.error("Failed to fetch course:", err)
                toast.error("Failed to load course content")
            } finally {
                setLoading(false)
            }
        }

        fetchCourse()
    }, [courseId])

    const handleGenerateDirect = async () => {
        if (!directTopic) {
            toast.error("Please enter a topic")
            return
        }
        setGenerating(true)
        const loadingToast = toast.loading("Generating your personalized course content...")
        try {
            const result = await createCourseAction(directTopic)
            if (result.success) {
                toast.success("Course generated successfully!", { id: loadingToast })
                router.push(`/ai-tools/course?id=${result.courseId}`)
            } else {
                throw new Error(result.error)
            }
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Failed to generate course", { id: loadingToast })
        } finally {
            setGenerating(false)
        }
    }

    if (loading) return <RoadmapSkeleton />

    if (!course) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
                <div className="max-w-2xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <Sparkles className="w-3 h-3" />
                            AI Educator
                        </div>
                        <h1 className="text-5xl font-black text-white uppercase tracking-tight leading-tight">
                            Personalized <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Course Generator</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium">
                            Enter any topic you want to master, and we'll build a structured deep-dive course just for you.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-32 -mt-32 rounded-full" />
                        <div className="relative z-10 space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <BookOpen className="w-3 h-3" /> Learning Topic
                                </label>
                                <input
                                    type="text"
                                    value={directTopic}
                                    onChange={(e) => setDirectTopic(e.target.value)}
                                    placeholder="e.g. Advanced React Patterns or Machine Learning Basics"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-white/10"
                                />
                            </div>

                            <button
                                onClick={handleGenerateDirect}
                                disabled={generating}
                                className="w-full py-6 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-2xl group"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Building Course...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 group-hover:scale-125 transition-transform" />
                                        <span>Generate Detailed Course</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Link href="/ai-tools" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Back to Features</span>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const currentModule = course.modules[activeModule]
    const currentLesson = currentModule?.lessons[activeLesson]
    const takeaways = JSON.parse(currentLesson?.takeaways || "[]")

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold tracking-tight">Go Back</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Course Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-3xl sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 px-2">Table of Contents</h3>
                            <div className="space-y-8">
                                {course.modules.map((module, mIdx) => (
                                    <div key={module.id} className="space-y-3">
                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                            <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                            {module.title}
                                        </div>
                                        <div className="space-y-1">
                                            {module.lessons.map((lesson, lIdx) => (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => {
                                                        setActiveModule(mIdx)
                                                        setActiveLesson(lIdx)
                                                    }}
                                                    className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all ${activeModule === mIdx && activeLesson === lIdx ? "bg-white text-black shadow-lg shadow-white/5" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                                                >
                                                    {lesson.title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lesson Content Area */}
                    <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-black uppercase tracking-widest border-glow">
                                <BookOpen className="w-3 h-3" />
                                {currentModule?.title}
                            </div>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-tight">
                                {currentLesson?.title}
                            </h1>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 lg:p-12 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />

                            <div className="prose prose-invert max-w-none mb-12">
                                <div className="text-slate-300 text-lg leading-relaxed space-y-6 font-medium whitespace-pre-wrap">
                                    {currentLesson?.content}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-green-400" /> Key Takeaways
                                    </h5>
                                    <div className="space-y-4">
                                        {takeaways.map((item: string, idx: number) => (
                                            <div key={idx} className="flex gap-4 group">
                                                <div className="shrink-0 w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]" />
                                                <p className="text-sm text-slate-300 font-semibold leading-relaxed">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {currentLesson?.videoUrl && (
                                    <div className="space-y-6">
                                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Youtube className="w-3 h-3 text-red-500" /> Recommended Lecture
                                        </h5>
                                        <a
                                            href={currentLesson.videoUrl}
                                            target="_blank"
                                            className="block p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                                        <PlayCircle className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase tracking-tight mb-1">Watch Tutorial</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Open Video on YouTube</p>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                                            </div>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex items-center justify-between pt-8">
                            <button
                                onClick={() => {
                                    if (activeLesson > 0) setActiveLesson(activeLesson - 1)
                                    else if (activeModule > 0) {
                                        setActiveModule(activeModule - 1)
                                        setActiveLesson(course.modules[activeModule - 1].lessons.length - 1)
                                    }
                                }}
                                disabled={activeModule === 0 && activeLesson === 0}
                                className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Previous Lesson
                            </button>
                            <button
                                onClick={() => {
                                    if (activeLesson < currentModule.lessons.length - 1) setActiveLesson(activeLesson + 1)
                                    else if (activeModule < course.modules.length - 1) {
                                        setActiveModule(activeModule + 1)
                                        setActiveLesson(0)
                                    }
                                }}
                                disabled={activeModule === course.modules.length - 1 && activeLesson === currentModule.lessons.length - 1}
                                className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
                            >
                                Next Lesson
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CoursePage() {
    return (
        <Suspense fallback={<RoadmapSkeleton />}>
            <CourseContent />
        </Suspense>
    )
}
