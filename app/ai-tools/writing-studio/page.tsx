"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import {
    FileText,
    Send,
    Sparkles,
    ArrowLeft,
    Loader2,
    Download,
    User,
    Briefcase,
    Copy,
    Check,
    History,
    Trash2,
    PenTool,
    ChevronDown,
    LayoutGrid,
    RefreshCw,
    Wand2,
    Plus,
    FileSearch,
    AlignLeft
} from "lucide-react"
import axios from "axios"
import Link from "next/link"
import { toast } from "sonner"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { saveAs } from "file-saver"
import { useSearchParams } from "next/navigation"
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

type DocType = "cover_letter" | "sop" | "motivation_letter" | "proposal"

interface DocumentItem {
    id: number
    docType: DocType
    context: string
    userDetails: string
    generatedContent: string
    createdAt: string
}

const docTypes = [
    {
        id: "cover_letter",
        title: "Cover Letter Generator",
        description: "Tailored cover letters that matching job descriptions perfectly.",
        icon: FileText,
        color: "from-blue-500 to-cyan-400"
    },
    {
        id: "sop",
        title: "Statement of Purpose",
        description: "Craft powerful SOPs for university or job applications.",
        icon: Sparkles,
        color: "from-purple-500 to-pink-400"
    },
    {
        id: "motivation_letter",
        title: "Motivation Letter",
        description: "Express your passion and fit for roles with personalized letters.",
        icon: PenTool,
        color: "from-orange-500 to-amber-400"
    },
    {
        id: "proposal",
        title: "Proposal Generator",
        description: "Generate structured and persuasive business proposals.",
        icon: Briefcase,
        color: "from-indigo-500 to-violet-400"
    }
]

const tones = ["Professional", "Formal", "Confident", "Technical", "Creative", "Friendly"]
const lengths = ["Short", "Medium", "Detailed"]

function WritingStudioContent() {
    const searchParams = useSearchParams()

    // We get docType from search params if deep-linked
    const linkedDocParam = searchParams.get("docType") as DocType | null
    const linkedIdParam = searchParams.get("id")

    const [selectedDoc, setSelectedDoc] = useState<DocType | null>(linkedDocParam)
    const [view, setView] = useState<"hub" | "studio">(linkedDocParam && linkedIdParam ? "studio" : "hub")
    const [tab, setTab] = useState<"generate" | "history">("generate")

    // Generation State
    const [context, setContext] = useState("")
    const [userDetails, setUserDetails] = useState("")
    const [tone, setTone] = useState("Professional")
    const [length, setLength] = useState("Medium")
    const [loading, setLoading] = useState(false)
    const [output, setOutput] = useState("")
    const [copied, setCopied] = useState(false)

    // History State
    const [history, setHistory] = useState<DocumentItem[]>([])
    const [fetchingHistory, setFetchingHistory] = useState(false)
    const [initializedFromLink, setInitializedFromLink] = useState(false)

    useEffect(() => {
        if (linkedIdParam && linkedDocParam && !initializedFromLink) {
            setLoading(true)
            axios.get(`/api/writing-studio/history?id=${linkedIdParam}`)
                .then(res => {
                    if (res.data) {
                        setContext(res.data.context)
                        setUserDetails(res.data.userDetails)
                        setOutput(res.data.generatedContent)
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch linked document details:", err)
                    toast.error("Failed to load historical document.")
                })
                .finally(() => {
                    setLoading(false)
                    setInitializedFromLink(true)
                })
        }
    }, [linkedIdParam, linkedDocParam, initializedFromLink])

    const fetchHistory = useCallback(async () => {
        if (!selectedDoc) return
        setFetchingHistory(true)
        try {
            const response = await axios.get(`/api/writing-studio/history?docType=${selectedDoc}`)
            setHistory(response.data)
        } catch (err) {
            console.error("Failed to fetch history:", err)
        } finally {
            setFetchingHistory(false)
        }
    }, [selectedDoc])

    useEffect(() => {
        if (tab === "history" && selectedDoc) {
            fetchHistory()
        }
    }, [tab, selectedDoc, fetchHistory])

    const handleGenerate = async () => {
        if (!context || !userDetails || !selectedDoc) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            const response = await axios.post("/api/writing-studio", {
                docType: selectedDoc,
                context,
                userDetails,
                tone,
                length
            })
            setOutput(response.data.doc.generatedContent)
            toast.success("Document generated and saved to history!")
            if (tab === "history") fetchHistory()
        } catch (err: any) {
            console.error(err)
            const status = err.response?.status;
            let errorMessage = "Failed to generate document";

            if (status === 429) {
                errorMessage = "The AI is currently under high load (Too Many Requests). Please wait a few seconds and try again.";
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            }

            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        setCopied(true)
        toast.success("Copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadAsWord = async () => {
        if (!output) return

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: output.split("\n").map(line => {
                        return new Paragraph({
                            children: [new TextRun(line)],
                            spacing: { after: 200 }
                        })
                    })
                }
            ]
        })

        const blob = await Packer.toBlob(doc)
        saveAs(blob, `${selectedDoc}_Output.docx`)
        toast.success("Downloading Word file...")
    }

    const downloadAsPdf = () => {
        // Simple Print trick for now, or could use library
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <html>
                <head>
                    <title>${selectedDoc} Output</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; line-height: 1.6; }
                        h1 { color: #333; }
                        pre { white-space: pre-wrap; word-wrap: break-word; }
                    </style>
                </head>
                <body>
                    <pre>${output}</pre>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        toast.success("Opening Print/PDF Dialog...");
    }

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/writing-studio/history?id=${id}`)
            toast.success("Document removed")
            fetchHistory()
        } catch (err) {
            toast.error("Failed to delete")
        }
    }

    const getSelectedTypeTitle = () => {
        return docTypes.find(d => d.id === selectedDoc)?.title || "AI Writing Studio"
    }

    if (view === "hub") {
        return (
            <div className="min-h-screen bg-[#020617] text-white py-4 md:py-6 lg:py-8 px-8 md:px-16 lg:px-24 selection:bg-blue-500/30">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <Link href="/dashboard" className="inline-flex items-center gap-2.5 text-slate-500 hover:text-white transition-all group font-bold text-[10px] uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                            <span>Return to Console</span>
                        </Link>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-[0.9]">
                                AI Professional <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 tracking-tighter">Writing Studio</span>
                            </h1>
                            <p className="text-sm text-slate-500 max-w-lg font-medium leading-relaxed uppercase tracking-widest opacity-80">
                                Elevate your professional presence with intelligently synthesized documents tailored for maximum impact.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {docTypes.map((type) => (
                            <div
                                key={type.id}
                                onClick={() => {
                                    setSelectedDoc(type.id as DocType)
                                    setView("studio")
                                }}
                                className="group relative flex flex-col bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 cursor-pointer hover:bg-white/[0.06] transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_0_80px_rgba(37,99,235,0.15)] overflow-hidden min-h-[320px]"
                            >
                                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${type.color} opacity-0 blur-[80px] -mr-20 -mt-20 group-hover:opacity-20 transition-opacity duration-700`} />

                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.color} p-4 mb-10 shadow-2xl transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500`}>
                                    <type.icon className="w-full h-full text-white" />
                                </div>

                                <div className="space-y-4 flex-1">
                                    <h3 className="text-xl font-black group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-tight">{type.title}</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed font-bold tracking-wide">{type.description}</p>
                                </div>

                                <div className="pt-8 mt-auto border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover:text-blue-400 transition-colors">Generate Now</span>
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                        <Plus className="w-5 h-5 group-hover:scale-110" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col">
            {/* Studio Header */}
            <div className="border-b border-white/5 bg-white/[0.01] backdrop-blur-3xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto w-full px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Link
                            href="/dashboard"
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-xs group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="space-y-0.5">
                            <h2 className="text-lg font-black uppercase tracking-tighter leading-none">{getSelectedTypeTitle()}</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Studio Console</span>
                                <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em]">Ready</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner scale-95 origin-right">
                        <button
                            onClick={() => setTab("generate")}
                            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[9px] font-black transition-all uppercase tracking-[0.2em] ${tab === "generate"
                                ? "bg-white text-black shadow-lg scale-[1.02]"
                                : "text-slate-500 hover:text-white"
                                }`}
                        >
                            <Wand2 className="w-4 h-4" />
                            Generate
                        </button>
                        <button
                            onClick={() => setTab("history")}
                            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[9px] font-black transition-all uppercase tracking-[0.2em] ${tab === "history"
                                ? "bg-white text-black shadow-lg scale-[1.02]"
                                : "text-slate-500 hover:text-white"
                                }`}
                        >
                            <History className="w-4 h-4" />
                            History
                        </button>
                    </div>
                </div>
            </div>

            {tab === "history" ? (
                <div className="max-w-5xl mx-auto w-full space-y-4 px-4 mt-4 pb-7 flex flex-col">
                    {fetchingHistory ? (
                        <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                            <div className="w-12 h-12 border-4 border-t-blue-500 border-white/5 rounded-full animate-spin mb-6" />
                            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[9px]">Accessing Secure History...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] rounded-[3rem] border border-white/5 backdrop-blur-3xl">
                            <History className="w-16 h-16 text-slate-800 mb-8 opacity-20" />
                            <h3 className="text-2xl font-black mb-3 uppercase tracking-tighter">History Empty</h3>
                            <p className="text-slate-500 max-w-xs text-center font-bold text-[11px] uppercase tracking-widest leading-loose opacity-60 px-8">You haven't archived any {getSelectedTypeTitle()} documents yet.</p>
                            <button
                                onClick={() => setTab("generate")}
                                className="mt-10 px-10 py-4 bg-white text-black rounded-xl text-[9px] font-black hover:bg-slate-100 transition-all shadow-xl hover:scale-105 uppercase tracking-[0.3em]"
                            >
                                Initiate Document
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 hover:bg-white/[0.06] transition-all duration-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.01)]"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                            <FileText className="w-5 h-5 text-white opacity-80" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button className="p-2.5 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-xl transition-all">
                                                        <Trash2 className="w-4.5 h-4.5" />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-[#020617] border-white/10 text-white rounded-[2.5rem] p-10">
                                                    <AlertDialogHeader className="space-y-4">
                                                        <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">Erase Document?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-slate-400 font-bold text-[13px] uppercase tracking-widest leading-loose">
                                                            This action will permanently purge this document from your secure history.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="mt-10">
                                                        <AlertDialogCancel className="bg-white/5 border-white/10 rounded-xl hover:bg-white/10 hover:text-white px-6 py-3.5 text-[9px] font-black uppercase">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(item.id)}
                                                            className="bg-red-600 hover:bg-red-700 rounded-xl font-black text-[9px] uppercase tracking-widest px-6 py-3.5"
                                                        >
                                                            Purge Record
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    <h4 className="text-base font-black line-clamp-2 mb-2 uppercase tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                                        {item.context}
                                    </h4>
                                    <p className="text-[9px] text-slate-500 line-clamp-3 leading-relaxed font-bold tracking-wide mb-4 uppercase opacity-60">
                                        {item.generatedContent}
                                    </p>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <button
                                            onClick={() => {
                                                setOutput(item.generatedContent)
                                                setContext(item.context)
                                                setUserDetails(item.userDetails)
                                                setTab("generate")
                                            }}
                                            className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
                                        >
                                            Open in Studio
                                        </button>
                                        <button
                                            onClick={() => {
                                                setOutput(item.generatedContent)
                                                setContext(item.context)
                                                setUserDetails(item.userDetails)
                                                setTab("generate")
                                            }}
                                            className="w-9 h-9 rounded-xl bg-white/5 shadow-inner flex items-center justify-center hover:bg-white hover:text-black transition-all"
                                        >
                                            <ArrowLeft className="w-4.5 h-4.5 rotate-180" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-5xl mx-auto w-full flex flex-col gap-7 px-8 mt-8 pb-14">
                    {/* LEFT PANEL: Inputs */}
                    <div className="space-y-8">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-5 md:p-9 shadow-2xl backdrop-blur-3xl relative overflow-hidden h-fit">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[100px] -mr-40 -mt-40 rounded-full pointer-events-none" />

                            <div className="space-y-10">
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-2xl text-white">
                                            <FileSearch className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black uppercase tracking-tighter">Strategic Context</h3>
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">Job Specs or Company Details</p>
                                        </div>
                                    </div>
                                    <textarea
                                        value={context}
                                        onChange={(e) => setContext(e.target.value)}
                                        placeholder="Paste the job description or business context here..."
                                        className="w-full min-h-[98px] bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 text-white placeholder:text-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none text-[13px] leading-relaxed font-medium shadow-inner"
                                    />
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-2xl text-white">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black uppercase tracking-tighter">Personal Synthesis</h3>
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">Key Experience or Achievements</p>
                                        </div>
                                    </div>
                                    <textarea
                                        value={userDetails}
                                        onChange={(e) => setUserDetails(e.target.value)}
                                        placeholder="Specify the achievements you want to highlight..."
                                        className="w-full min-h-[98px] bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 text-white placeholder:text-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none text-[13px] leading-relaxed font-medium shadow-inner"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 italic">Articulate Tone</label>
                                        <div className="relative group">
                                            <select
                                                value={tone}
                                                onChange={(e) => setTone(e.target.value)}
                                                className="w-full h-11 bg-white/[0.03] border border-white/10 rounded-xl px-5 appearance-none text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                                            >
                                                {tones.map(t => <option key={t} value={t} className="bg-[#020617]">{t}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 group-hover:text-white pointer-events-none transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 italic">Output Length</label>
                                        <div className="relative group">
                                            <select
                                                value={length}
                                                onChange={(e) => setLength(e.target.value)}
                                                className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-5 appearance-none text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                                            >
                                                {lengths.map(l => <option key={l} value={l} className="bg-[#020617]">{l}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 group-hover:text-white pointer-events-none transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="w-full h-[48px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-black text-[8px] uppercase tracking-[0.35em] flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_50px_rgba(37,99,235,0.2)] relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out" />
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span className="relative z-10">Synthesizing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5 relative z-10 group-hover:scale-110 transition-transform" />
                                            <span className="relative z-10">Generate Document</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Output/Preview */}
                    <div className="h-full">
                        {loading ? (
                            <div className="h-full min-h-[400px] max-h-[70vh] bg-white/[0.01] border border-white/5 rounded-[3rem] p-12 flex flex-col gap-8 animate-pulse shadow-inner">
                                <div className="w-1/4 h-8 bg-white/5 rounded-xl" />
                                <div className="w-full h-4 bg-white/5 rounded-full" />
                                <div className="w-full h-4 bg-white/5 rounded-full" />
                                <div className="w-3/4 h-4 bg-white/5 rounded-full" />
                                <div className="flex-1 w-full bg-white/[0.02] rounded-[2.5rem] border border-white/5" />
                            </div>
                        ) : output ? (
                            <div className="flex flex-col bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-7 md:p-9 shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-10 duration-1000 relative overflow-hidden h-fit max-h-[75vh] min-h-[600px]">
                                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 blur-[100px] -ml-40 -mb-40 rounded-full pointer-events-none" />

                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-500 border border-white/10 shadow-2xl font-bold">
                                            <AlignLeft className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Integrated Preview</p>
                                            <p className="text-[13px] font-black text-white uppercase tracking-tighter">Polished Strategy</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={copyToClipboard}
                                            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-slate-500 hover:text-white shadow-xl"
                                            title="Copy to Clipboard"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={downloadAsWord}
                                            className="flex items-center gap-2.5 px-6 py-3 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-[0.25em] hover:bg-slate-100 transition-all shadow-xl hover:scale-105"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>DOCX</span>
                                        </button>
                                        <button
                                            onClick={downloadAsPdf}
                                            className="flex items-center gap-2.5 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.25em] hover:bg-blue-700 transition-all shadow-xl hover:scale-105"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>PDF</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 bg-white/[0.02] rounded-[2.5rem] border border-white/5 overflow-y-auto flex flex-col shadow-inner relative group custom-scrollbar">
                                    <textarea
                                        value={output}
                                        onChange={(e) => setOutput(e.target.value)}
                                        className="w-full h-full min-h-[400px] bg-transparent p-12 md:p-16 focus:outline-none text-slate-300 font-serif italic text-lg leading-relaxed resize-none selection:bg-blue-500/30 whitespace-pre-wrap break-words"
                                    />
                                </div>

                                <div className="mt-8 flex items-center justify-between">
                                    <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-full border border-white/5">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
                                            Archived in History
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleGenerate}
                                        className="flex items-center gap-2.5 text-[8px] font-black text-slate-500 hover:text-white px-6 py-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 uppercase tracking-[0.3em] transition-all"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Regenerate
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[600px] border-2 border-dashed border-white/5 rounded-[3.5rem] bg-white/[0.01] flex flex-col items-center justify-center p-16 text-center group shadow-inner">
                                <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-3xl group-hover:scale-110 group-hover:border-blue-500/20 transition-all duration-1000 group-hover:rotate-6">
                                    <Wand2 className="w-10 h-10 text-slate-800 group-hover:text-blue-500 transition-all duration-700" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-3">Awaiting Synthesis</h3>
                                <p className="text-slate-600 max-w-xs font-bold text-[11px] uppercase tracking-widest leading-loose opacity-60">Input coordinates to generate an opportunity-winning document.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function WritingStudioPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617]">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-white/5 rounded-full animate-spin mb-6" />
            </div>
        }>
            <WritingStudioContent />
        </Suspense>
    )
}
