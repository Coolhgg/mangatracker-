export interface FiltersPanelProps {
  children?: React.ReactNode;
}

export const FiltersPanel = ({ children }: FiltersPanelProps) => {
  return (
    <aside className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold">Filters</h3>
      <div className="mt-3 space-y-3 text-sm text-muted-foreground">
        {children || (
          <>
            <div className="flex items-center justify-between"><span>Status</span><select className="rounded-md border bg-background px-2 py-1 text-sm"><option>Any</option><option>Ongoing</option><option>Completed</option></select></div>
            <div className="flex items-center justify-between"><span>Rating</span><select className="rounded-md border bg-background px-2 py-1 text-sm"><option>Any</option><option>4★+</option><option>3★+</option></select></div>
          </>
        )}
      </div>
    </aside>
  );
};