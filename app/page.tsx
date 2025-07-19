"use client";

import { useRouter } from "next/navigation";
import Navigation from "@/components/welcome/navigation";
import HeroSection from "@/components/welcome/hero-section";
import StudentBenefits from "@/components/welcome/student-benefits";
import SessionHighlights from "@/components/welcome/session-highlights";

export default function WelcomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/samples");
  };

  return (
    <div className="font-sans antialiased">
      <Navigation onGetStarted={handleGetStarted} />
      <HeroSection onGetStarted={handleGetStarted} />
      <StudentBenefits />
      <SessionHighlights />
    </div>
  );
}