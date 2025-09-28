export const ThreadSidebar = ({ title, children }: { title?: string; children?: React.ReactNode }) => {
  return (
    <aside className="rounded-lg border bg-card p-4">
      {title && <h3 className="text-sm font-semibold">{title}</h3>}
      <div className="mt-3 space-y-3 text-sm text-muted-foreground">{children}</div>
    </aside>
  );
};