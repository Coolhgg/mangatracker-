import { LibraryLoader } from "@/components/library/library-loader";

export const metadata = {
  title: "Library — Kenmei",
  description: "View and manage the series you're tracking across sites.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: { canonical: "/library" },
  robots: { index: false, follow: false },
};

export default function LibraryPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Library</h1>
      <p className="text-muted-foreground mb-6">View and manage series you're tracking.</p>
      <div className="rounded-lg border bg-card p-6">
        {/* Client-side loader handles PHASE1_MOCK: only short-circuits when no session */}
        <LibraryLoader />
      </div>
    </div>
  );
}