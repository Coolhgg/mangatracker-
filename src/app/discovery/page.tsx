import DiscoveryLoader from "@/components/discovery/discovery-loader";

export const metadata = {
  title: "Discover — Kenmei",
  description: "Find your next favorite manga/manhwa with smart picks and filters.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: { canonical: "/discovery" },
  openGraph: {
    type: "website",
    siteName: "Kenmei",
    url: "/discovery",
    title: "Discover — Kenmei",
    description: "Find your next favorite manga/manhwa with smart picks and filters.",
    images: [
      {
        url:
          "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-discovery-section-12.jpg?",
        width: 1200,
        height: 630,
        alt: "Discover manga and manhwa on Kenmei",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover — Kenmei",
    description: "Find your next favorite manga/manhwa with smart picks and filters.",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-discovery-section-12.jpg?",
    ],
  },
  robots: { index: true, follow: true },
};

export default async function DiscoveryPage() {
  // Server component delegates to client loader that calls /api/discovery with loading/error/optimistic states
  return <DiscoveryLoader />;
}