import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFullUserProfile } from "@/lib/db/profile";
import CareerDashboardClient from "./CareerDashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Career Readiness Dashboard | Saarthi",
    description: "Your personalized command center for job market readiness and skill gap analysis.",
};

export default async function CareerDashboardPage() {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
        redirect("/sign-in");
    }

    const profileData = await getFullUserProfile(userEmail);

    return <CareerDashboardClient profileData={profileData} />;
}
