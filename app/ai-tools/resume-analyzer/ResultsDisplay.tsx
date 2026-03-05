"use client"

import { Download, Sparkles } from "lucide-react"
import { AnalysisResult } from "@/types"

interface ResultsDisplayProps {
    result: AnalysisResult;
    onReset: () => void;
    onDownload: () => void;
}

export default function ResultsDisplay({ result, onReset, onDownload }: ResultsDisplayProps) {
    return (
        <div className="animate-in fade-in zoom-in-95 duration-700">
            {/* Results View */}
            <div className="flex flex-col gap-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Analysis Results</h2>
                {/* Top Section: Score Card */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden border border-white/10 flex flex-col gap-8 w-full">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl -mr-32 -mt-32 rounded-full" />

                    <div className="flex flex-col md:flex-row items-center gap-8 w-full z-10 relative">
                        <div className="text-center shrink-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                                <Sparkles className="w-3 h-3" />
                                Job Ready
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="relative">
                                    <svg className="w-40 h-40 md:w-48 md:h-48 transform -rotate-90 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r="42%"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            className="text-white/5"
                                        />
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r="42%"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={264}
                                            strokeDashoffset={264 * (1 - result.score / 100)}
                                            className={`${result.score > 70 ? 'text-green-400' : result.score > 40 ? 'text-yellow-400' : 'text-red-400'} transition-all duration-1000 ease-out`}
                                            strokeLinecap="round"
                                            pathLength="100"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl md:text-6xl font-black">{result.score}</span>
                                        <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">% Match</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Executive Summary */}
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner flex-1 w-full text-left relative z-10 self-stretch flex items-center">
                            <p className="text-sm leading-relaxed text-slate-300 font-medium">
                                {result.summary}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10">
                        <button
                            onClick={onDownload}
                            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-[10px] uppercase tracking-widest font-black"
                        >
                            <Download className="w-4 h-4" />
                            Download Detailed PDF Report
                        </button>
                        <button
                            onClick={onReset}
                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all text-white text-[10px] uppercase tracking-widest font-black"
                        >
                            Analyze Another Resume
                        </button>
                    </div>
                </div>

                {/* Main Details Section */}
                <div className="space-y-6 w-full text-left">
                    {/* Breakdown */}
                    <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 backdrop-blur-xl shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Score Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {Object.entries(result.scoreBreakdown).map(([key, val]) => (
                                <div key={key} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{key}</p>
                                    <p className="text-2xl font-black text-white">{val}%</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gaps and Strengths */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-500/5 rounded-[2.5rem] p-8 border border-red-500/10 backdrop-blur-xl">
                            <h3 className="text-lg font-black text-red-400 mb-6 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                Critical Gaps
                            </h3>
                            <ul className="space-y-3">
                                {result.criticalGaps.map((gap, i) => (
                                    <li key={i} className="text-sm text-slate-300 font-medium flex items-start gap-3">
                                        <span className="text-red-500 mt-1">•</span>
                                        {gap}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-green-500/5 rounded-[2.5rem] p-8 border border-green-500/10 backdrop-blur-xl">
                            <h3 className="text-lg font-black text-green-400 mb-6 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                Key Strengths
                            </h3>
                            <ul className="space-y-3">
                                {result.strengths.map((str, i) => (
                                    <li key={i} className="text-sm text-slate-300 font-medium flex items-start gap-3">
                                        <span className="text-green-500 mt-1">•</span>
                                        {str}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
