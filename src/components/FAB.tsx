"use client";
import { Plus } from "lucide-react";

export const FAB = ({ onClick }: { onClick?: () => void }) => (
  <button onClick={onClick} className="fixed bottom-6 right-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow">
    <Plus className="h-5 w-5" />
  </button>
);