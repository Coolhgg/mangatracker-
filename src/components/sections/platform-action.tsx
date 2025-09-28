"use client";

import { GateButton } from "@/components/autumn/feature-gate";

const subFeatures = [
  {
    icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/platform-filter-icon-4.svg?',
    title: 'Filter by genres, tags, reading status',
    alt: 'Filter icon',
  },
  {
    icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/platform-notes-icon-5.svg?',
    title: 'Add notes, rate titles, and create tags',
    alt: 'Notes icon',
  },
  {
    icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/platform-history-icon-6.svg?',
    title: 'Keep a detailed history',
    alt: 'History icon',
  },
];

const PlatformActionSection = () => {
  return (
    <section className="bg-background py-20">
      <div className="mx-5 2xl:mx-0">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#18191c]">
          <img
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/platform-bg-10.png?"
            alt="Platform background image"
            className="absolute inset-0 -z-10 h-full w-full opacity-10 object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="relative z-10">
            <div className="flex flex-col items-start justify-between px-8 py-12 sm:flex-row sm:items-center sm:px-16 sm:pb-20">
              <div className="mb-6 sm:mb-0">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  See the platform in action.
                  <br className="hidden sm:block" />
                  <span className="font-normal text-gray-400">
                    Start tracking in under 1 minute.
                  </span>
                </h2>
              </div>
              <GateButton
                featureId="discovery"
                href="/discovery"
                className="shrink-0 rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 shadow-md transition-colors hover:bg-gray-100"
              >
                Get started for free
              </GateButton>
            </div>

            <div className="grid grid-cols-1 items-stretch lg:grid-cols-3">
              <div className="flex h-full flex-col justify-between px-8 pb-12 sm:px-16 sm:pb-16 lg:pb-8">
                <div>
                  <div className="mb-4 flex items-start gap-4">
                    <img
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/bookmark-icon-3.svg?"
                      alt="Bookmark icon"
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0"
                      loading="lazy"
                      decoding="async"
                    />
                    <h4 className="mt-1 text-xl font-semibold text-white">
                      Take Control of Your Collection
                    </h4>
                  </div>
                  <div className="lg:pl-14">
                    <p className="mb-4 text-gray-400">
                      Sort it, filter it, tag it—make your library truly yours. Add notes, drop ratings, or create custom tags to keep track of everything exactly how you like it.
                    </p>
                    <p className="text-gray-400">
                      Managing your collection just got a whole lot easier (and way more fun).
                    </p>
                  </div>
                </div>

                <div className="mt-10 divide-y divide-white/10 lg:pt-14">
                  {subFeatures.map((feature) => (
                    <div key={feature.title} className="flex items-center gap-4 py-4">
                      <div className="rounded-lg bg-white/10 p-2">
                        <img
                          src={feature.icon}
                          alt={feature.alt}
                          width={20}
                          height={20}
                          className="h-5 w-5"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <h4 className="font-medium text-white">{feature.title}</h4>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                <img
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/platform-11.jpg?"
                  alt="Platform interface preview"
                  width={1400}
                  height={1000}
                  className="h-full w-full object-cover object-left"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformActionSection;