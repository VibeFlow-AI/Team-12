import Sidebar from "@/components/dashboard/sidebar";
import DiscoverPage from "@/components/dashboard/discover-page";
import Navbar from "@/components/navbar";

export default function SamplesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <DiscoverPage />
        </main>
      </div>
    </div>
  );
}
