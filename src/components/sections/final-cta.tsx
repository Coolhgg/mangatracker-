"use client";
import { GateButton } from "@/components/autumn/feature-gate";

const FinalCta = () => {
  return (
    <section className="container py-20">
      <div className="relative overflow-hidden rounded-3xl text-center">
        <img
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/bg-cta-17.png?"
          alt="Scenic landscape background"
          className="absolute inset-0 z-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center px-6 py-28">
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Ready for Your Next Favourite Read?
          </h2>
          <GateButton
            featureId="discovery"
            href="/discovery"
            className="mt-8 rounded-md bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-100"
          >
            Get started for free
          </GateButton>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;