import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If user is authenticated and trying to access auth pages
    if (token && pathname.startsWith("/auth")) {
      // Check if onboarding is completed
      if (!token.onboardingCompleted) {
        const onboardingPath = `/onboarding/${token.role}`;
        return NextResponse.redirect(new URL(onboardingPath, req.url));
      }
      // If onboarding completed, redirect to samples
      return NextResponse.redirect(new URL("/samples", req.url));
    }

    // If user is authenticated but onboarding not completed, redirect to onboarding
    if (token && !token.onboardingCompleted && !pathname.startsWith("/onboarding")) {
      const onboardingPath = `/onboarding/${token.role}`;
      return NextResponse.redirect(new URL(onboardingPath, req.url));
    }

    // If user completed onboarding but trying to access onboarding, redirect to dashboard
    if (token && token.onboardingCompleted && pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/samples", req.url));
    }

    // Redirect mentors to mentor dashboard
    if (token && token.role === "mentor" && token.onboardingCompleted) {
      if (pathname === "/dashboard" || pathname === "/samples") {
        return NextResponse.redirect(new URL("/mentor/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        // If accessing auth pages and authenticated, allow middleware to handle redirect
        if (pathname.startsWith("/auth")) {
          return true;
        }

        // Allow access to onboarding pages for authenticated users
        if (pathname.startsWith("/onboarding")) {
          return !!token;
        }
        
        // Require authentication for samples page
        if (pathname.startsWith("/samples")) {
          return !!token;
        }
        
        // Allow access to other pages
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/samples/:path*", "/auth/:path*", "/onboarding/:path*", "/dashboard/:path*", "/mentor/:path*"],
};