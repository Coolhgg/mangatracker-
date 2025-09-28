"use client";
import { useEffect } from "react";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Drawer = ({ open, onClose, children }: DrawerProps) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-[90%] sm:w-[420px] bg-card border-l p-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};