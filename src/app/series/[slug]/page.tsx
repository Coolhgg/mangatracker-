import { notFound } from "next/navigation";
import { ChaptersList } from "@/components/series/chapters-list";
import { AddToLibrary } from "@/components/series/add-to-library";
import { ProgressPanel } from "@/components/series/progress-panel";
import { SeriesStats } from "@/components/series/series-stats";
import type { Metadata } from "next";
import { SeriesComments } from "@/components/series/series-comments";

interface Series {
  id: number
  slug: string
  title: string
  description?: string
  coverImageUrl?: string
  tags?: string[]
  source?: {
    name: string
    url?: string
  }
}

async function getSeries(slug: string): Promise<Series | null> {
  // Fetch from real API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/series/${slug}`, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return null;
  const s = await res.json();
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    description: s.description || "",
    coverImageUrl: s.coverImageUrl,
    tags: Array.isArray(s.tags) ? s.tags : [],
    source: s.source ? { name: s.source.name, url: s.source.url } : undefined,
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const series = await getSeries(params.slug);
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const canonical = `/series/${params.slug}`;
  const fallbackImage =
    "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-hero-bg-1.jpg?";

  if (series) {
    const rawDesc = series.description?.trim() || `Track and read ${series.title} on Kenmei.`;
    const description = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}…` : rawDesc;
    const imageUrl = series.coverImageUrl || fallbackImage;

    return {
      title: `${series.title} — Kenmei`,
      description,
      metadataBase,
      alternates: { canonical },
      openGraph: {
        type: "article",
        siteName: "Kenmei",
        url: canonical,
        title: `${series.title} — Kenmei`,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: series.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${series.title} — Kenmei`,
        description,
        images: [imageUrl],
      },
      robots: { index: true, follow: true },
    };
  }

  const notFoundTitle = "Series not found — Kenmei";
  const notFoundDesc = "We couldn't find that series. Explore trending titles and recommendations on Kenmei.";
  return {
    title: notFoundTitle,
    description: notFoundDesc,
    metadataBase,
    alternates: { canonical },
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: "Kenmei",
      url: canonical,
      title: notFoundTitle,
      description: notFoundDesc,
      images: [
        {
          url: fallbackImage,
          width: 1200,
          height: 630,
          alt: "Series not found",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: notFoundTitle,
      description: notFoundDesc,
      images: [fallbackImage],
    },
  };
}

export default async function SeriesPage({ params }: { params: { slug: string } }) {
  const series = await getSeries(params.slug)
  if (!series) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {series.coverImageUrl ? (
            <img
              src={series.coverImageUrl}
              alt={series.title}
              className="w-full md:w-64 h-auto rounded-lg border"
            />
          ) : null}

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
            {series.tags && series.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {series.tags.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground border">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            {series.description ? (
              <p className="text-muted-foreground whitespace-pre-line mb-6">{series.description}</p>
            ) : null}

            <div className="flex items-center gap-3">
              {series.source?.url ? (
                <a
                  href={series.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
                >
                  Open on {series.source.name || "Source"}
                </a>
              ) : null}

              {/* Chapters remain external — no internal /reader/[slug]/[chapterId] */}
              <AddToLibrary slug={series.slug} />
            </div>

            {/* Progress overview for this series */}
            <ProgressPanel slug={series.slug} />

            {/* Series stats */}
            <div className="mt-6">
              <SeriesStats slug={series.slug} />
            </div>

            {/* Render external chapter links fetched client-side with auth */}
            <ChaptersList slug={series.slug} />

            {/* Comments & threaded replies */}
            <SeriesComments slug={series.slug} />
          </div>
        </div>
      </div>
    </div>
  )
}