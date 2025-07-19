import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import MentorSidebar from "@/components/dashboard/mentor-sidebar";
import MentorNavbar from "@/components/dashboard/mentor-navbar";

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Check if user is a mentor
  if (session.user.role !== "mentor") {
    redirect("/dashboard");
  }

  // Check if onboarding is completed
  if (!session.user.onboardingCompleted) {
    redirect(`/onboarding/mentor`);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <MentorNavbar />
      <div className="flex">
        <MentorSidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}