"use client";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="mx-auto container px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/light-logo-8ogL60VF-1.svg?" alt="Kenmei" className="h-6 w-auto" />
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/library" className="hover:text-foreground">Track</Link>
          <Link href="/discover" className="hover:text-foreground">Discover</Link>
          <Link href="/social" className="hover:text-foreground">Social</Link>
          <Link href="/pricing" className="hover:text-foreground">Premium</Link>
          <Link href="/legal/terms" className="hover:text-foreground">Resources</Link>
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login" className="px-3 py-2 text-sm rounded-md border hover:bg-accent">Log in</Link>
          <Link href="/register" className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground shadow">Register</Link>
        </div>
        <button className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-3 grid gap-2">
            <Link href="/library" onClick={() => setOpen(false)}>Track</Link>
            <Link href="/discover" onClick={() => setOpen(false)}>Discover</Link>
            <Link href="/social" onClick={() => setOpen(false)}>Social</Link>
            <Link href="/pricing" onClick={() => setOpen(false)}>Premium</Link>
            <Link href="/legal/terms" onClick={() => setOpen(false)}>Resources</Link>
            <div className="h-px bg-border my-2" />
            <Link href="/login" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md border">Log in</Link>
            <Link href="/register" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md bg-primary text-primary-foreground">Register</Link>
          </div>
        </div>
      )}
    </header>
  );
};