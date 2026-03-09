"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import {
    LayoutDashboard,
    FileText,
    Map,
    MessageCircle,
    Video,
    PenTool,
    History,
    User,
    Search,
    BookOpen,
    Target
} from "lucide-react"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search tools, roadmaps, settings..." />
            <CommandList className="bg-slate-950 border-t border-white/5">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Popular Tools">
                    <CommandItem onSelect={() => runCommand(() => router.push("/ai-tools/resume-builder"))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Resume Architect</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/ai-tools/roadmap"))}>
                        <Map className="mr-2 h-4 w-4" />
                        <span>AI Learning Roadmaps</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/ai-tools/career-dashboard"))}>
                        <Target className="mr-2 h-4 w-4" />
                        <span>Career Readiness Dashboard</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="All Features">
                    <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Main Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/ai-tools/ai-chat"))}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Career Advisor Chat</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/ai-tools/mock-interview"))}>
                        <Video className="mr-2 h-4 w-4" />
                        <span>Mock Interviews</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/ai-tools/writing-studio"))}>
                        <PenTool className="mr-2 h-4 w-4" />
                        <span>AI Writing Studio</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/ai-tools/course"))}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Course Viewer</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Workspace">
                    <CommandItem onSelect={() => runCommand(() => router.push("/history"))}>
                        <History className="mr-2 h-4 w-4" />
                        <span>Generation History</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/saarthi-profile"))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
