// ... keep existing code ...
// remove next/image import to avoid remote host config errors

const featureData = [
  {
    title: "Track Everything, Everywhere",
    description: "Stay ahead of your favourite series with seamless cross-site tracking across 20+ websites.",
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-track-everything-4.jpg?",
    alt: "Track Everything, Everywhere",
  },
  {
    title: "Find Your Next Read",
    description: "Search through 30,000+ titles and find exactly what you want—with powerful sorting and filtering.",
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-find-next-6.jpg?",
    alt: "Find Your Next Read",
  },
  {
    title: "Your Library, Your Way",
    description: "Shape your library any way you want—filters, tags, ratings, and all the tools you need to keep it personal.",
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-organise-8.jpg?",
    alt: "Your Library, Your Way",
  },
];

const CrossSiteTrackingSection = () => {
  return (
    <section id="track" className="bg-background py-20 lg:py-24">
      <div className="container">
        <div className="mb-12 flex flex-col items-start gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cross-site tracking.
            <br />
            <span className="font-normal text-muted-foreground">
              If Series Exists, You'll Find It Here.
            </span>
          </h2>
          <a
            href="https://www.kenmei.co/supported-sites"
            className="flex-shrink-0 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            Check 20+ supported sites →
          </a>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featureData.map((feature) => (
            <div key={feature.title} className="group text-center md:text-left">
              <img
                src={feature.imageSrc}
                alt={feature.alt}
                loading="lazy"
                decoding="async"
                className="h-auto w-full rounded-xl border border-border object-cover shadow-sm transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-xl"
              />
              <h4 className="mb-2 mt-6 text-lg font-semibold text-foreground">
                {feature.title}
              </h4>
              <p className="text-base leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CrossSiteTrackingSection;