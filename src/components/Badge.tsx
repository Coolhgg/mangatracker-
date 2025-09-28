export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
}

export const Badge = ({ children, variant = "default" }: BadgeProps) => {
  const map: Record<string, string> = {
    default: "border bg-secondary text-secondary-foreground",
    success: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-300",
    warning: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/30 dark:text-amber-300",
    destructive: "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/30 dark:text-rose-300",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${map[variant]}`}>{children}</span>
  );
};