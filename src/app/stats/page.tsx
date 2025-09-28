import Navigation from "@/components/sections/navigation";
import Footer from "@/components/sections/footer";
import { StatsClient } from "@/components/stats/stats-client";

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Reading Stats</h1>
            <p className="text-sm md:text-base text-muted-foreground">Weekly reading graph and genre breakdown based on your library and progress.</p>
          </div>
        </div>
        <StatsClient />
      </main>
      <Footer />
    </div>
  );
}