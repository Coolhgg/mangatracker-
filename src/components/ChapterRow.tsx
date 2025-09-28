import MarkReadButton from "@/components/series/mark-read-button";

export interface ChapterRowProps {
  id: string;
  title: string;
  number?: number | string;
  url?: string | null;
}

export const ChapterRow = ({ id, title, number, url }: ChapterRowProps) => {
  return (
    <li className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {number != null && (
          <p className="text-xs text-muted-foreground">Chapter {String(number)}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-md border px-3 py-1.5 text-xs hover:bg-accent">Open</a>
        )}
        <MarkReadButton chapterId={id} />
      </div>
    </li>
  );
};