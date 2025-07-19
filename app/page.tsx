"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Navigation from "@/components/welcome/navigation";
import HeroSection from "@/components/welcome/hero-section";
import StudentBenefits from "@/components/welcome/student-benefits";
import SessionHighlights from "@/components/welcome/session-highlights";

export default function WelcomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleGetStarted = () => {
    // If user is authenticated, go to samples dashboard
    if (session) {
      router.push("/samples");
    } else {
      router.push("/auth/signup");
    }
  };

  return (
    <div className="font-sans antialiased">
      <Navigation onGetStarted={handleGetStarted} isAuthenticated={!!session} />
      <HeroSection onGetStarted={handleGetStarted} />
      <StudentBenefits />
      <SessionHighlights />
    </div>
  );
}