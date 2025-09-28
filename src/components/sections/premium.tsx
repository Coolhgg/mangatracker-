import Link from 'next/link';

interface Feature {
  title: string;
  description: string;
  image: string;
  alt: string;
}

const premiumFeatures: Feature[] = [
  {
    title: 'Personalized Recommendations',
    description: "The more you read, the better we get at suggesting series you'll love—tailored for you.",
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-personalized-reccs-14.jpg?',
    alt: 'A UI showing personalized manga recommendations.',
  },
  {
    title: 'Smart Suggestions System',
    description: 'Get real-time notifications and tailored suggestions to keep your list organized and up to date.',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-smart-suggestions-15.jpg?',
    alt: 'A UI showing smart suggestions for manga tracking.',
  },
  {
    title: 'And More...',
    description: 'From profile customization to early access features, level-up your experience even more.',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-discovery-16.jpg?',
    alt: 'A UI showcasing various extra premium features like custom collections.',
  },
];

const PremiumSection = () => {
  return (
    <section id="premium" className="container py-20 lg:py-24">
      <div className="mb-16 flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            Go Premium &amp; Unlock More.
            <br className="hidden sm:block" />
            <span className="font-normal text-muted-foreground">
              Supercharge Your Tracking Experience.
            </span>
          </h2>
        </div>
        <Link
          href="/pricing"
          className="inline-block flex-shrink-0 rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white shadow-md transition-shadow duration-200 hover:shadow-lg"
        >
          Explore premium
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
        {premiumFeatures.map((feature, index) => (
          <div key={index}>
            <div className="mb-5 overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
              <img
                src={feature.image}
                alt={feature.alt}
                width={360}
                height={210}
                loading="lazy"
                decoding="async"
                className="h-auto w-full object-cover"
              />
            </div>
            <h4 className="mb-2 text-lg font-semibold text-foreground">
              {feature.title}
            </h4>
            <p className="text-base text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PremiumSection;