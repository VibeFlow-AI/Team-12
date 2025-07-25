import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/dashboard/sidebar";
import StudentNavbar from "@/components/dashboard/student-navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Check if onboarding is completed
  if (!session.user.onboardingCompleted) {
    redirect(`/onboarding/${session.user.role}`);
  }

  // Redirect mentors to their dashboard
  if (session.user.role === "mentor") {
    redirect("/mentor/dashboard");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <StudentNavbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}