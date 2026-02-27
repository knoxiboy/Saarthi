"use client";

import { useState } from "react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { Sparkles, FileText, Map, MessageCircle, FileEdit, ArrowRight, Mail, Linkedin, Github } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col selection:bg-blue-500/30">
      {/* Navbar */}
      <header className="fixed w-full bg-slate-950/20 backdrop-blur-2xl border-b border-white/5 z-50">
        <div className="px-12 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] group-hover:rotate-3 transition-transform">
              S
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter">
              Saarthi
            </h1>
          </Link>

          <div className="flex items-center gap-6">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-black uppercase tracking-widest border border-white/10 transition-all">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all">
                  Join Now
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <button
                onClick={() => setShowSignOutDialog(true)}
                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl text-sm font-black uppercase tracking-widest border border-red-500/20 transition-all"
              >
                Logout
              </button>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-40 relative overflow-hidden">
        <section className="px-6 pb-32 relative z-10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-12 border border-blue-500/20 backdrop-blur-md animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Career Navigation Platform
            </div>

            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-10">
              Architect Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                Career Trajectory.
              </span>
            </h2>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Saarthi empowers your professional growth with AI-driven insights. Leverage advanced tools for resume optimization, profile analysis, and personalized career roadmaps.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-32">
              <SignedIn>
                <Link href="/dashboard">
                  <button className="group px-10 py-4 bg-blue-600 text-white rounded-2xl text-lg font-bold uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                </Link>
              </SignedIn>
              <SignedOut>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <button className="group px-10 py-4 bg-white text-slate-950 rounded-2xl text-lg font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3 whitespace-nowrap">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                </SignUpButton>
              </SignedOut>
            </div>

            {/* Feature Bento Grid */}
            <div id="features" className="flex flex-wrap justify-center gap-8 pb-32">
              {[
                { icon: MessageCircle, title: "Career Advisor", desc: "Receive on-demand, personalized career guidance.", gradient: "from-blue-600 to-cyan-600" },
                { icon: FileText, title: "Resume Architect", desc: "Gain a competitive edge with professional resumes.", gradient: "from-purple-600 to-indigo-600" },
                { icon: Map, title: "Smart Roadmaps", desc: "Discover learning pathways tailored to target roles.", gradient: "from-emerald-600 to-teal-600" },
                { icon: FileEdit, title: "ATS Optimization", desc: "Receive actionable feedback to maximize ATS scores.", gradient: "from-orange-600 to-rose-600" },
                { icon: FileEdit, title: "Cover Letters", desc: "Generate compelling letters that capture attention.", gradient: "from-cyan-600 to-blue-600" },
              ].map((feature: any, i) => (
                <div key={i} className="group relative p-8 glass-card rounded-3xl transition-all duration-500 hover:-translate-y-2 w-full sm:w-[calc(50%-2rem)] lg:w-[calc(33.33%-2rem)] min-w-[280px] sm:min-w-[300px] max-w-full sm:max-w-[400px]">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-8 group-hover:scale-110 transition-transform shadow-xl`}>
                    <div className="w-full h-full bg-slate-950 rounded-[calc(1rem+4px)] flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-bold text-base">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 blur-[180px] rounded-full animate-pulse opacity-50"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/15 blur-[180px] rounded-full opacity-40"></div>

          {/* Enhanced Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/80 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">S</div>
            <span className="font-black text-xl text-white tracking-tighter">Saarthi</span>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest">© 2026 Saarthi. Built for Hackathon Excellence.</p>
          <div className="flex items-center gap-8">
            <a href="mailto:divysaxena2402@gmail.com" className="hover:text-blue-400 transition-all hover:scale-110" title="Email">
              <Mail className="w-6 h-6" />
            </a>
            <a href="https://linkedin.com/in/divyasaxena24/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-all hover:scale-110" title="LinkedIn">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="https://github.com/divysaxena24" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-all hover:scale-110" title="GitHub">
              <Github className="w-6 h-6" />
            </a>
          </div>
          <div className="flex gap-8 text-sm font-black uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
      {/* Confirm Sign Out Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              You will need to log in again to access Saarthi's full features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white border-none rounded-xl"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
