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
      <div className="relative min-h-screen overflow-hidden z-40 py-16">
        {/* Background Gradients */}
        <div
          className="pointer-events-none absolute -top-32 -left-64 w-[1000px] h-[1000px] rounded-full blur-[200px] z-0"
          style={{
            background:
              "radial-gradient(circle, rgba(134, 239, 172, 0.4), transparent)",
          }}
        ></div>
        <div
          className="pointer-events-none absolute top-0 right-0 w-[900px] h-[900px] rounded-full blur-[200px] z-0"
          style={{
            background:
              "radial-gradient(circle, rgba(147, 197, 253, 0.4), transparent)",
          }}
        ></div>
        <div
          className="pointer-events-none absolute bottom-0 -right-64 w-[1000px] h-[1000px] rounded-full blur-[200px] z-0"
          style={{
            background:
              "radial-gradient(circle, rgba(216, 180, 254, 0.4), transparent)",
          }}
        ></div>

        {/* Content Layers (z-10) */}
        <div className="relative z-10">
          <AnimatedCardsSection />
          <SessionHighlights />
        </div>
      </div>
      <Footer />
    </div>
  );
}
