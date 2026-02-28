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

function CourseContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const courseId = searchParams.get("id")
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [course, setCourse] = useState<CourseData | null>(null)
    const [activeSection, setActiveSection] = useState(0)
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
    const [showQuizResult, setShowQuizResult] = useState(false)
    const [directTopic, setDirectTopic] = useState("")

    useEffect(() => {
        if (!courseId) {
            setLoading(false)
            return
        }

        const fetchCourse = async () => {
            setLoading(true)
            try {
                const response = await axios.get(`/api/course/detail?id=${courseId}`)
                setCourse(JSON.parse(response.data.content))
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
            const response = await axios.post("/api/course", { topic: directTopic })
            toast.success("Course generated successfully!", { id: loadingToast })
            router.push(`/ai-tools/course?id=${response.data.courseId}`)
        } catch (err) {
            console.error(err)
            toast.error("Failed to generate course", { id: loadingToast })
        } finally {
            setGenerating(false)
        }
    }

    const handleAnswer = (qIdx: number, answer: string) => {
        setQuizAnswers(prev => ({ ...prev, [qIdx]: answer }))
    }

    const calculateScore = () => {
        if (!course) return 0
        let correct = 0
        course.quiz.forEach((q, idx) => {
            if (quizAnswers[idx] === q.correctAnswer) correct++
        })
        return correct
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
                        <Link href="/ai-tools/roadmap" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Back to Roadmap</span>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold tracking-tight">Go Back</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border-glow">
                                <Sparkles className="w-3 h-3" />
                                Personalised Course
                            </div>
                            <h1 className="text-5xl font-black tracking-tight mb-6 uppercase leading-[1.1]">
                                {course.title}
                            </h1>
                            <p className="text-xl text-slate-400 leading-relaxed font-medium">
                                {course.description}
                            </p>
                        </div>

                        {/* Navigation Tabs for Mobile */}
                        <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                            {course.sections.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveSection(idx)}
                                    className={`shrink-0 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeSection === idx ? "bg-white text-black border-white shadow-lg" : "bg-white/5 text-slate-500 border-white/10"}`}
                                >
                                    Section {idx + 1}
                                </button>
                            ))}
                        </div>

                        {/* Active Section Content */}
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />

                                <h2 className="text-3xl font-black mb-10 flex items-center gap-4 uppercase tracking-tight">
                                    <span className="text-slate-500 font-black italic">0{activeSection + 1}</span>
                                    {course.sections[activeSection].heading}
                                </h2>

                                <div className="prose prose-invert max-w-none mb-12">
                                    <div className="text-slate-300 text-lg leading-relaxed space-y-6 font-medium whitespace-pre-wrap">
                                        {course.sections[activeSection].content}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <CheckCircle2 className="w-3 h-3 text-green-400" /> Key Takeaways
                                        </h5>
                                        <div className="space-y-4">
                                            {course.sections[activeSection].keyTakeaways.map((item, idx) => (
                                                <div key={idx} className="flex gap-4 group">
                                                    <div className="shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)] group-hover:scale-125 transition-transform" />
                                                    <p className="text-sm text-slate-300 font-semibold leading-relaxed">{item}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Youtube className="w-3 h-3 text-red-500" /> Recommended Lecture
                                        </h5>
                                        <a
                                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(course.sections[activeSection].videoSearchQuery)}`}
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
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Click to search on YouTube</p>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Quiz Section (Only visible after all sections or as a persistent part) */}
                            <div className="bg-white/2 border border-blue-500/10 rounded-[3rem] p-12 backdrop-blur-3xl relative overflow-hidden border-glow">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                                <div className="flex items-center justify-between mb-12">
                                    <h2 className="text-3xl font-black flex items-center gap-4 uppercase tracking-tight">
                                        <BrainCircuit className="w-8 h-8 text-blue-500" /> Topic Quiz
                                    </h2>
                                    {showQuizResult && (
                                        <div className="px-6 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            <Trophy className="w-4 h-4" /> Score: {calculateScore()}/{course.quiz.length}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-12">
                                    {course.quiz.map((q, qIdx) => (
                                        <div key={qIdx} className="space-y-6">
                                            <p className="text-xl font-bold flex gap-4">
                                                <span className="text-slate-600">Q{qIdx + 1}.</span>
                                                {q.question}
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                                                {q.options.map((option, oIdx) => {
                                                    const isSelected = quizAnswers[qIdx] === option
                                                    const isCorrect = option === q.correctAnswer
                                                    const showResult = showQuizResult

                                                    let variantStyles = "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                                                    if (isSelected && !showResult) variantStyles = "bg-blue-600 border-blue-500 shadow-lg"
                                                    if (showResult) {
                                                        if (isCorrect) variantStyles = "bg-green-500/20 border-green-500/20 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                                        else if (isSelected) variantStyles = "bg-red-500/20 border-red-500/20 text-red-400"
                                                    }

                                                    return (
                                                        <button
                                                            key={oIdx}
                                                            onClick={() => !showResult && handleAnswer(qIdx, option)}
                                                            className={`p-5 rounded-2xl border text-left text-[13px] font-bold transition-all ${variantStyles}`}
                                                        >
                                                            {option}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowQuizResult(true)}
                                    disabled={showQuizResult || Object.keys(quizAnswers).length < course.quiz.length}
                                    className="mt-12 w-full py-5 bg-white text-black disabled:bg-white/10 disabled:text-slate-600 rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl"
                                >
                                    Check My Knowledge
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Navigation & Resources */}
                    <div className="lg:col-span-1 space-y-10">
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl sticky top-12 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />

                            <h3 className="text-sm font-black text-white mb-10 uppercase tracking-[0.2em] flex items-center gap-3">
                                <BookOpen className="w-4 h-4 text-blue-400" /> Course Content
                            </h3>

                            <div className="space-y-4">
                                {course.sections.map((section, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveSection(idx)}
                                        className={`w-full flex items-start gap-5 p-5 rounded-2xl transition-all group ${activeSection === idx ? "bg-white/10 border border-white/10 shadow-lg" : "hover:bg-white/5 border border-transparent"}`}
                                    >
                                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${activeSection === idx ? "bg-white text-black" : "bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-white"}`}>
                                            {idx + 1}
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-[11px] font-black uppercase tracking-tight mb-1 transition-colors ${activeSection === idx ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}>
                                                {section.heading}
                                            </p>
                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full inline-block">
                                                Module {idx + 1}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-12 pt-12 border-t border-white/5 space-y-8">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <ChevronRight className="w-3 h-3" /> Study Resources
                                </h3>
                                <div className="space-y-4">
                                    {course.studyResources.map((res, idx) => (
                                        <a key={idx} href={res.link} target="_blank" className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                                            <div>
                                                <p className="text-[11px] font-bold text-white mb-1">{res.name}</p>
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{res.type}</p>
                                            </div>
                                            <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-blue-400 transition-colors" />
                                        </a>
                                    ))}
                                </div>
                            </div>
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
