"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
    label?: string;
    className?: string;
}

export function BackButton({ label = "Go Back", className = "" }: BackButtonProps) {
    const router = useRouter()

    return (
        <button
            onClick={() => router.back()}
            className={`inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group ${className}`}
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">{label}</span>
        </button>
    )
}
