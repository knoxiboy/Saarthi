"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
    Map,
    MessageSquare,
    FileText,
    History as HistoryIcon,
    Trash2,
    Loader2,
    ArrowRight,
    Search,
    Clock,
    Calendar,
    ChevronRight,
    MapPin,
    Briefcase
} from "lucide-react"
import axios from "axios"
import Link from "next/link"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RoadmapItem, ChatItem, CoverLetterItem, ResumeAnalysisItem } from "@/types"


function HistoryContent() {
    const searchParams = useSearchParams()
    const tabParam = searchParams.get("tab")
    const [activeTab, setActiveTab] = useState(tabParam || "roadmaps")
    const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([])
    const [chats, setChats] = useState<ChatItem[]>([])
    const [coverLetters, setCoverLetters] = useState<CoverLetterItem[]>([])
    const [resumes, setResumes] = useState<ResumeAnalysisItem[]>([])
    const [savedResumes, setSavedResumes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchRoadmaps = useCallback(async () => {
        try {
            const response = await axios.get("/api/roadmap/history")
            const formatted = response.data.map((item: any) => ({
                id: item.id,
                targetField: item.targetField,
                createdAt: item.createdAt,
                roadmapData: item.roadmapData
            }))
            setRoadmaps(formatted)
        } catch (err) {
            console.error("Failed to fetch roadmap history:", err)
        }
    }, [])

    const fetchChats = useCallback(async () => {
        try {
            const response = await axios.get("/api/ai-career-chat-agent/history")
            setChats(response.data)
        } catch (err) {
            console.error("Failed to fetch chat history:", err)
        }
    }, [])

    const fetchCoverLetters = useCallback(async () => {
        try {
            const response = await axios.get("/api/cover-letter/history")
            setCoverLetters(response.data)
        } catch (err) {
            console.error("Failed to fetch cover letter history:", err)
        }
    }, [])

    const fetchResumes = useCallback(async () => {
        try {
            const response = await axios.get("/api/resume-analyzer/history")
            setResumes(response.data)
        } catch (err) {
            console.error("Failed to fetch resume history:", err)
        }
    }, [])

    const fetchSavedResumes = useCallback(async () => {
        try {
            const response = await axios.get("/api/resume-builder")
            setSavedResumes(response.data)
        } catch (err) {
            console.error("Failed to fetch saved resumes:", err)
        }
    }, [])

    const fetchAllHistory = useCallback(async () => {
        setLoading(true)
        await Promise.all([
            fetchRoadmaps(),
            fetchChats(),
            fetchCoverLetters(),
            fetchResumes(),
            fetchSavedResumes()
        ])
        setLoading(false)
    }, [fetchRoadmaps, fetchChats, fetchCoverLetters, fetchResumes, fetchSavedResumes])

    useEffect(() => {
        fetchAllHistory()
    }, [fetchAllHistory])

    const handleDeleteRoadmap = async (id: number) => {
        try {
            await axios.delete(`/api/roadmap/history?id=${id}`)
            toast.success("Roadmap deleted successfully")
            setRoadmaps(roadmaps.filter(item => item.id !== id))
        } catch (err) {
            toast.error("Failed to delete roadmap")
        }
    }

    const handleDeleteChat = async (chatId: string) => {
        try {
            await axios.delete(`/api/ai-career-chat-agent/history?chatId=${chatId}`)
            toast.success("Chat history deleted successfully")
            setChats(chats.filter(item => item.chatId !== chatId))
        } catch (err) {
            toast.error("Failed to delete chat")
        }
    }

    const handleDeleteCoverLetter = async (id: number) => {
        try {
            await axios.delete(`/api/cover-letter/history?id=${id}`)
            toast.success("Cover letter deleted successfully")
            setCoverLetters(coverLetters.filter(item => item.id !== id))
        } catch (err) {
            toast.error("Failed to delete cover letter")
        }
    }

    const handleDeleteResume = async (id: number) => {
        try {
            await axios.delete(`/api/resume-analyzer/history?id=${id}`)
            toast.success("Resume analysis deleted successfully")
            setResumes(resumes.filter(item => item.id !== id))
        } catch (err) {
            toast.error("Failed to delete resume analysis")
        }
    }

    const handleDeleteSavedResume = async (id: number) => {
        try {
            await axios.delete(`/api/resume-builder?id=${id}`)
            toast.success("Resume deleted successfully")
            setSavedResumes(savedResumes.filter(item => item.id !== id))
        } catch (err) {
            toast.error("Failed to delete resume")
        }
    }

    const filteredRoadmaps = roadmaps.filter(item =>
        item.targetField.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredChats = chats.filter(item =>
        (item.chatTitle || "Untitled Chat").toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredCoverLetters = filteredCoverLettersBySearch(coverLetters, searchQuery)

    function filteredCoverLettersBySearch(items: CoverLetterItem[], query: string) {
        return items.filter(item =>
            item.jobDescription.toLowerCase().includes(query.toLowerCase()) ||
            item.coverLetter.toLowerCase().includes(query.toLowerCase())
        )
    }

    const filteredResumes = resumes.filter(item =>
        (item.jobDescription || "General Analysis").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.analysisData?.summary || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredSavedResumes = savedResumes.filter(item =>
        (item.resumeName || "Untitled Resume").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.resumeData?.personalInfo?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">
            {/* Atmospheric Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] -mr-48 -mt-48 rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] -ml-48 -mb-48 rounded-full pointer-events-none" />

            <div className="p-8 lg:p-16 space-y-12 max-w-7xl mx-auto w-full relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-widest leading-none shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md">
                            <Clock className="w-4 h-4" />
                            Activity Log
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">History</span>
                        </h1>
                        <p className="text-slate-400 text-base font-medium leading-relaxed max-w-xl">
                            Review and manage all your past interactions, generated documents, and analyses.
                        </p>
                    </div>

                    <div className="relative group w-full md:w-96">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="SEARCH HISTORY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-xl transition-all shadow-2xl"
                        />
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
                    <TabsList className="bg-white/5 p-2 rounded-[2rem] h-auto flex flex-nowrap gap-2 overflow-x-auto no-scrollbar justify-start md:justify-center border border-white/10 backdrop-blur-xl shadow-xl">
                        {[
                            { id: "roadmaps", icon: Map, label: "Roadmaps", count: roadmaps.length },
                            { id: "chats", icon: MessageSquare, label: "Expert Chat", count: chats.length },
                            { id: "cover-letters", icon: FileText, label: "Cover Letters", count: coverLetters.length },
                            { id: "resumes", icon: Search, label: "Analysis", count: resumes.length },
                            { id: "saved-resumes", icon: Briefcase, label: "Drafts", count: savedResumes.length },
                        ].map(tab => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="rounded-[1.5rem] px-6 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(37,99,235,0.3)] text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-3 whitespace-nowrap group relative"
                            >
                                <tab.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                {tab.label}
                                <span className="bg-white/5 px-2 py-0.5 rounded-lg text-[8px] opacity-60">
                                    {tab.count}
                                </span>
                                {activeTab === tab.id && (
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                                <Loader2 className="w-12 h-12 text-blue-500 animate-[spin_2s_linear_infinite] relative z-10" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Loading Records</p>
                                <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">Please wait...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <TabsContent value="roadmaps" className="focus-visible:outline-none ring-0">
                                {filteredRoadmaps.length === 0 ? (
                                    <EmptyState
                                        icon={<Map className="w-10 h-10" />}
                                        title="No Roadmaps"
                                        description={searchQuery ? "No matching roadmaps found." : "Your generated roadmaps will be stored here."}
                                        action={!searchQuery ? { label: "Create Roadmap", href: "/ai-tools/roadmap" } : undefined}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filteredRoadmaps.map((item) => (
                                            <HistoryCard
                                                key={item.id}
                                                icon={<Map className="w-6 h-6" />}
                                                title={item.targetField}
                                                date={new Date(item.createdAt).toLocaleDateString()}
                                                href="/ai-tools/roadmap"
                                                onDelete={() => handleDeleteRoadmap(item.id)}
                                                deleteTitle="Delete Roadmap?"
                                                deleteDescription="This action will permanently delete this roadmap."
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="chats" className="focus-visible:outline-none ring-0">
                                {filteredChats.length === 0 ? (
                                    <EmptyState
                                        icon={<MessageSquare className="w-10 h-10" />}
                                        title="No Chats"
                                        description={searchQuery ? "No matching chats found." : "Your chats will appear here."}
                                        action={!searchQuery ? { label: "Start Chat", href: "/ai-tools/ai-chat" } : undefined}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filteredChats.map((item) => (
                                            <HistoryCard
                                                key={item.chatId}
                                                icon={<MessageSquare className="w-6 h-6" />}
                                                title={item.chatTitle || "Untitled Communication"}
                                                date={new Date(item.createdAt).toLocaleDateString()}
                                                href={`/ai-tools/ai-chat?chatId=${item.chatId}`}
                                                onDelete={() => handleDeleteChat(item.chatId)}
                                                deleteTitle="Delete Chat?"
                                                deleteDescription="This action will permanently delete this chat."
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="cover-letters" className="focus-visible:outline-none ring-0">
                                {filteredCoverLetters.length === 0 ? (
                                    <EmptyState
                                        icon={<FileText className="w-10 h-10" />}
                                        title="No Cover Letters"
                                        description={searchQuery ? "No matching cover letters found." : "Generated cover letters will be stored here."}
                                        action={!searchQuery ? { label: "Create Cover Letter", href: "/ai-tools/cover-letter" } : undefined}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filteredCoverLetters.map((item) => (
                                            <HistoryCard
                                                key={item.id}
                                                icon={<FileText className="w-6 h-6" />}
                                                title={item.jobDescription}
                                                date={new Date(item.createdAt).toLocaleDateString()}
                                                href="/ai-tools/cover-letter"
                                                onDelete={() => handleDeleteCoverLetter(item.id)}
                                                deleteTitle="Delete Cover Letter?"
                                                deleteDescription="This action will permanently delete this cover letter."
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="resumes" className="focus-visible:outline-none ring-0">
                                {filteredResumes.length === 0 ? (
                                    <EmptyState
                                        icon={<Search className="w-10 h-10" />}
                                        title="No Resumes Analyzed"
                                        description={searchQuery ? "No matching analyzed resumes found." : "Analyzed resumes will appear here."}
                                        action={!searchQuery ? { label: "Analyze Resume", href: "/ai-tools/resume-analyzer" } : undefined}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filteredResumes.map((item) => (
                                            <HistoryCard
                                                key={item.id}
                                                icon={<Search className="w-6 h-6" />}
                                                title={item.jobDescription || "Resume Analysis"}
                                                date={new Date(item.createdAt).toLocaleDateString()}
                                                href="/ai-tools/resume-analyzer"
                                                onDelete={() => handleDeleteResume(item.id)}
                                                deleteTitle="Delete Analysis?"
                                                deleteDescription={`This analysis will be permanently deleted${item.resumeName ? ` for ${item.resumeName}` : ""}.`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="saved-resumes" className="focus-visible:outline-none ring-0">
                                {filteredSavedResumes.length === 0 ? (
                                    <EmptyState
                                        icon={<Briefcase className="w-10 h-10" />}
                                        title="No Built Resumes"
                                        description={searchQuery ? "No matching resumes found." : "Your created resumes will be managed here."}
                                        action={!searchQuery ? { label: "Create Resume", href: "/ai-tools/resume-builder" } : undefined}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filteredSavedResumes.map((item) => (
                                            <HistoryCard
                                                key={item.id}
                                                icon={<Briefcase className="w-6 h-6" />}
                                                title={item.resumeName || item.resumeData?.personalInfo?.fullName || "Untitled Resume"}
                                                date={new Date(item.createdAt).toLocaleDateString()}
                                                href={`/ai-tools/resume-builder?id=${item.id}`}
                                                onDelete={() => handleDeleteSavedResume(item.id)}
                                                deleteTitle="Delete Resume?"
                                                deleteDescription="This resume will be permanently deleted."
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    )}
                </Tabs>
            </div>
        </div>
    )
}

export default function HistoryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
                <Loader2 className="w-12 h-12 text-blue-500 animate-[spin_2s_linear_infinite]" />
                <div className="space-y-2 text-center">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Loading Records</p>
                    <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">Please wait...</p>
                </div>
            </div>
        }>
            <HistoryContent />
        </Suspense>
    )
}

function HistoryCard({
    icon,
    title,
    date,
    href,
    onDelete,
    deleteTitle,
    deleteDescription
}: {
    icon: React.ReactNode,
    title: string,
    date: string,
    href: string,
    onDelete: () => void,
    deleteTitle: string,
    deleteDescription: string
}) {
    return (
        <div className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl hover:bg-white/[0.08] hover:border-blue-500/30 transition-all duration-500 backdrop-blur-3xl overflow-hidden flex flex-col h-full">
            {/* Hover Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-blue-500/20 transition-all duration-700" />

            <div className="relative z-10 flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                    <div className="w-14 h-14 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                        {icon}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-white/5 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
                            {date}
                        </span>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="p-3 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white rounded-xl opacity-40 group-hover:opacity-100 transition-all duration-300">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border border-white/10 rounded-[2.5rem] backdrop-blur-3xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-black text-white uppercase tracking-tight">{deleteTitle}</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400 font-medium">{deleteDescription}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-8">
                                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest px-8">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest px-8">Confirm Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="flex-1">
                    <h4 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                        {title}
                    </h4>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        <div className="w-1.5 h-1.5 bg-blue-500/30 rounded-full" />
                        <div className="w-1.5 h-1.5 bg-blue-500/10 rounded-full" />
                    </div>
                    <Link
                        href={href}
                        className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-3 group/link hover:text-blue-400 transition-all bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10"
                    >
                        View Details
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    )
}

function EmptyState({
    icon,
    title,
    description,
    action
}: {
    icon: React.ReactNode,
    title: string,
    description: string,
    action?: { label: string, href: string }
}) {
    return (
        <div className="flex flex-col items-center justify-center py-32 bg-white/2 rounded-[4rem] border-2 border-dashed border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/2 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-slate-600 mb-8 border border-white/10 shadow-3xl relative z-10 transition-transform group-hover:rotate-12 duration-500">
                {icon}
            </div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter relative z-10">{title}</h3>
            <p className="text-slate-500 font-bold mb-10 text-center max-w-sm px-8 uppercase text-[10px] tracking-widest leading-relaxed relative z-10">{description}</p>
            {action && (
                <Link
                    href={action.href}
                    className="px-10 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 hover:bg-slate-200 flex items-center gap-4 group/btn shadow-[0_0_30px_rgba(255,255,255,0.1)] relative z-10"
                >
                    {action.label}
                    <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center group-hover/btn:rotate-45 transition-transform duration-500">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </Link>
            )}
        </div>
    )
}
