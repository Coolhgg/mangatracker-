"use client";
import { motion } from "framer-motion";

export interface SeriesCardProps {
  title: string;
  cover?: string | null;
  subtitle?: string;
}

export const SeriesCard = ({ title, cover, subtitle }: SeriesCardProps) => {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="card-base overflow-hidden rounded-lg border bg-card">
      <div className="aspect-[3/4] w-full bg-muted overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">No cover</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight line-clamp-2">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{subtitle}</p>}
      </div>
    </motion.div>
  );
};