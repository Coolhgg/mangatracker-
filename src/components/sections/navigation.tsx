"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCustomer } from "autumn-js/react";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Navigation() {
  const router = useRouter();
  const { customer, isLoading } = useCustomer();
  const planName = customer?.products?.[0]?.name || "Free Plan";

  const { data: session, isPending, refetch } = useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      try {
        localStorage.removeItem("bearer_token");
      } catch {}
      await refetch();
      router.push("/");
      toast.success("Signed out");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative flex h-16 items-center">
        {/* Left: Logo */}
        <div className="flex">
          <Link href="/" className="flex items-center">
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/light-logo-8ogL60VF-1.svg?"
              alt="Kenmei logo"
              width={80}
              height={24}
              className="w-20"
              loading="lazy"
              decoding="async"
            />
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/library" className="text-sm text-foreground/80 hover:text-foreground">Track</Link>
            <Link href="/discovery" className="text-sm text-foreground/80 hover:text-foreground">Discover</Link>
            <Link href="/social" className="text-sm text-foreground/80 hover:text-foreground">Social</Link>
            <Link href="/pricing" className="text-sm text-foreground/80 hover:text-foreground">Premium</Link>
            <Link href="/stats" className="text-sm text-foreground/80 hover:text-foreground">Stats</Link>
          </nav>
        </div>

        {/* Right: Plan badge + Auth */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Link
            href="/pricing"
            className="hidden md:inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent"
          >
            {isLoading ? "Loading…" : planName}
          </Link>

          {/* Auth controls */}
          {isPending ? (
            <div className="text-xs text-muted-foreground">Checking session…</div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[120px]" title={user.email || user.name || "Account"}>
                {user.name || user.email || "Account"}
              </span>
              <Button variant="ghost" asChild>
                <Link href="/account">Account</Link>
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>Log out</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="rounded-md bg-foreground text-background hover:bg-foreground/90">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}