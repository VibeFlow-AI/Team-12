import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    onboardingCompleted: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      onboardingCompleted: boolean;
    };
  }
}