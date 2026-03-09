"use client"

import { TEMPLATES } from "@/components/resume/ResumeTemplates"
import { ResumeData } from "@/types"
import { Check, Info } from "lucide-react"

interface ResumeTemplatesSelectorProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
}

export default function ResumeTemplatesSelector({ data, onChange }: ResumeTemplatesSelectorProps) {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Design Architecture</h2>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Choose a template that aligns with your career trajectory</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TEMPLATES.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onChange({ ...data, template: template.id })}
                        className={`group relative p-8 rounded-[2.5rem] border-2 transition-all text-left overflow-hidden ${data.template === template.id
                                ? "bg-white border-white shadow-2xl shadow-white/10"
                                : "bg-white/5 border-white/5 hover:border-white/20"
                            }`}
                    >
                        {data.template === template.id && (
                            <div className="absolute top-6 right-6 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}

                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${data.template === template.id ? "bg-black/5 border-black/10" : "bg-white/5 border-white/10"
                            }`}>
                            <div className={`w-6 h-6 rounded-sm ${data.template === template.id ? "bg-black" : "bg-white/40"
                                } ${template.id === 'creative' ? 'rounded-full' : ''}`} />
                        </div>

                        <h3 className={`text-lg font-black uppercase tracking-tight mb-2 ${data.template === template.id ? "text-black" : "text-white"
                            }`}>
                            {template.name}
                        </h3>
                        <p className={`text-xs font-medium leading-relaxed ${data.template === template.id ? "text-slate-600" : "text-slate-400"
                            }`}>
                            {template.description}
                        </p>

                        <div className={`mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${data.template === template.id ? "text-blue-600" : "text-slate-500"
                            }`}>
                            <Info className="w-3 h-3" />
                            Preview Active
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
