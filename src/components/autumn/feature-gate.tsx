"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCustomer } from "autumn-js/react";
import { toast } from "sonner";

// Simple premium check fallback until feature-based checks are configured
const isPremium = (customer: any | null | undefined) => {
  const products: any[] = customer?.products ?? [];
  if (!products.length) return false;
  // Treat anything not explicitly named "Free" as premium
  const name = products[0]?.name?.toLowerCase?.() || "";
  return name && !name.includes("free");
};

export type GateButtonProps = {
  featureId: string; // Feature identifier (placeholder until Autumn features are wired)
  children: React.ReactNode;
  className?: string;
  // If allowed, navigate to this href (optional). Otherwise you can pass onAllowed
  href?: string;
  onAllowed?: () => void | Promise<void>;
  // Optional custom message when blocked
  blockedMessage?: string;
};

export const GateButton: React.FC<GateButtonProps> = ({
  featureId,
  children,
  className,
  href,
  onAllowed,
  blockedMessage,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { customer, isLoading } = useCustomer();

  const handleClick = async () => {
    if (isLoading) return; // wait until customer state resolves

    // Not logged in – send to login first
    if (!customer) {
      const redirect = encodeURIComponent(href || pathname || "/");
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    // Premium gate (until feature checks are available)
    if (!isPremium(customer)) {
      toast.block?.("Upgrade Required");
      toast.info(blockedMessage || "This is a premium feature. Upgrade to unlock it.");
      router.push("/pricing");
      return;
    }

    // Allowed
    if (onAllowed) await onAllowed();
    else if (href) router.push(href);
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

export default GateButton;