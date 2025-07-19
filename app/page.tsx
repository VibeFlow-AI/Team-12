"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Navigation from "@/components/welcome/navigation";
import HeroSection from "@/components/welcome/hero-section";
import StudentBenefits from "@/components/welcome/student-benefits";
import SessionHighlights from "@/components/welcome/highlights";
import AnimatedCardsSection from "@/components/welcome/animated-cards";
import Footer from "@/components/welcome/footer";

export default function WelcomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleGetStarted = () => {
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

      {/* Gradient wrapper only around these two sections */}
      <div className="relative min-h-screen overflow-hidden py-16">
        {/* Background Gradients */}
        {/* LEFT SIDE - Blue + Pink */}
        <div
          className="pointer-events-none absolute -top-32 -left-64 w-[1000px] h-[1800px] rounded-full blur-[200px] z-0"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 132, 255, 0.17), transparent)",
          }}
        ></div>

        <div
          className="pointer-events-none absolute top-64 -left-80 w-[800px] h-[800px] rounded-full blur-[200px] z-0"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 102, 102, 0.15), transparent)",
          }}
        ></div>

        {/* RIGHT SIDE - Yellow + Purple */}
        <div
          className="pointer-events-none absolute top-0 right-0 w-[900px] h-[900px] rounded-full blur-[200px] z-0"
          style={{
            background:
              "radial-gradient(circle, rgba(217, 255, 0, 0.17), transparent)",
          }}
        ></div>

        <div
          className="pointer-events-none absolute bottom-0 -right-64 w-[1000px] h-[1000px] rounded-full blur-[200px] z-0"
          style={{
            background:
              "radial-gradient(circle, rgba(216, 180, 254, 0.4), transparent)",
          }}
        ></div>

        <div className="relative z-10">
          <AnimatedCardsSection />
          <SessionHighlights />
        </div>
      </div>
      <Footer />
    </div>
  );
}
