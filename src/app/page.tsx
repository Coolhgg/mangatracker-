import Navigation from "@/components/sections/navigation";
import HeroSection from "@/components/sections/hero";
import CrossSiteTrackingSection from "@/components/sections/cross-site-tracking";
import PlatformActionSection from "@/components/sections/platform-action";
import DiscoveryTool from "@/components/sections/discovery-tool";
import Community from "@/components/sections/community";
import Premium from "@/components/sections/premium";
import FinalCTA from "@/components/sections/final-cta";
import Footer from "@/components/sections/footer";
import { Suspense } from "react";
import ComponentsGalleryLoader from "@/components/demos/components-gallery-loader";
import CommentRatingDemo from "@/components/demos/comment-rating-demo";
import type { Metadata } from "next";

// Build a safe absolute base URL even if env lacks protocol (common on Vercel)
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || "http://localhost:3000";
const safeSiteUrl = rawSiteUrl.startsWith("http") ? rawSiteUrl : `https://${rawSiteUrl}`;

export const metadata: Metadata = {
  title: "Kenmei — Every Series, One Tracker",
  description: "Track, discover, and sync your reading across 20+ sites.",
  metadataBase: new URL(safeSiteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Kenmei",
    url: "/",
    title: "Kenmei — Every Series, One Tracker",
    description: "Track, discover, and sync your reading across 20+ sites.",
    images: [
      {
        url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-hero-bg-1.jpg?",
        width: 1200,
        height: 630,
        alt: "Kenmei — Every Series, One Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kenmei — Every Series, One Tracker",
    description: "Track, discover, and sync your reading across 20+ sites.",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-hero-bg-1.jpg?",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main>
        <HeroSection />
        <CrossSiteTrackingSection />
        <PlatformActionSection />
        <Suspense
          fallback={
            <div className="container mx-auto px-4 py-10">
              <section className="rounded-lg border bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Recommendations</h2>
                    <p className="text-sm text-muted-foreground">Loading picks…</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] rounded-md border bg-muted/40 animate-pulse" />
                  ))}
                </div>
              </section>
            </div>
          }
        >
          <DiscoveryTool />
        </Suspense>
        <Community />
        <Premium />
        <ComponentsGalleryLoader />
        <CommentRatingDemo />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}