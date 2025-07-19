import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/dashboard/sidebar";

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

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}