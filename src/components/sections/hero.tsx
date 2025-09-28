"use client";
import React from "react";
import { GateButton } from "@/components/autumn/feature-gate";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-hero-bg-1.jpg?"
          alt="Hero background"
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/80 to-white dark:from-black/40 dark:via-black/60 dark:to-black" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 py-24 text-center md:py-28">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
          Every Series
          <span className="inline-block align-middle mx-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/icons/hero-bookmark-2.png?"
              alt="accent"
              width={64}
              height={24}
              className="inline-block h-8 w-auto sm:h-10 md:h-12"
              loading="lazy"
              decoding="async"
            />
          </span>
          One Tracker
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Sync your reading across 20+ sites. Track, discover, and enjoy—effortlessly.
        </p>
        <div className="mt-8">
          <GateButton
            featureId="discovery"
            href="/discovery"
            className="rounded-md bg-foreground px-6 py-3 text-background font-medium shadow hover:bg-foreground/90 transition-colors"
          >
            Get started for free
          </GateButton>
        </div>

        {/* Dashboard preview (light) */}
        <div className="mt-12 mx-auto max-w-5xl overflow-hidden rounded-lg border shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-hero-dashboard-2.jpg?"
            alt="Dashboard preview"
            className="w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}