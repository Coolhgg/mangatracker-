"use client";
import { toast } from "sonner";

export const Toasts = {
  success: (m: string) => toast.success(m),
  error: (m: string) => toast.error(m),
  info: (m: string) => toast(m),
};