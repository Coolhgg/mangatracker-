export interface SeriesTableRowProps {
  title: string;
  lastRead?: string;
  status?: string;
}

export const SeriesTableRow = ({ title, lastRead, status }: SeriesTableRowProps) => {
  return (
    <tr className="border-b">
      <td className="px-4 py-3 text-sm font-medium">{title}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{lastRead || "—"}</td>
      <td className="px-4 py-3 text-xs"><span className="inline-flex items-center rounded-md border px-2 py-1">{status || "Unknown"}</span></td>
      <td className="px-4 py-3 text-right text-sm"><button className="rounded-md border px-3 py-1 hover:bg-accent">Open</button></td>
    </tr>
  );
};