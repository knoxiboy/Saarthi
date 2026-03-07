import type { Metadata } from "next"
import LandingPage from "@/components/layout/LandingPage"

export const metadata: Metadata = {
  title: "Saarthi - AI Career Coach & Navigator",
  description: "Level up your professional life with Saarthi's AI-driven career tools. From interactive learning roadmaps and professional resume building to job readiness scores and career advisory.",
}

export default function Home() {
  return <LandingPage />
}
