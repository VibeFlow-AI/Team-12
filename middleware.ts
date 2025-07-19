import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If user is authenticated and trying to access auth pages, redirect to samples
    if (token && pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/samples", req.url));
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
  matcher: ["/samples/:path*", "/auth/:path*"],
};