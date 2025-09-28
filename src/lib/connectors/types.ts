export interface Pagination {
  page?: number;
  limit?: number;
  since?: string | number | Date;
}

export interface SeriesItem {
  id: string;
  title: string;
  altTitles?: string[];
  description?: string;
  tags?: string[];
  language?: string;
  coverUrl?: string; // optional cover image URL if available
}

export interface ChapterItem {
  id: string;
  title?: string;
  number?: number;
  publishedAt?: string;
  url: string;
}

export interface ConnectorHealth {
  ok: boolean;
  message?: string;
}

export interface Connector {
  id: string; // e.g., "mangadex"
  name: string;
  fetchSeriesList(pagination?: Pagination): Promise<SeriesItem[]>;
  fetchSeriesMetadata(sourceSeriesId: string): Promise<SeriesItem | null>;
  fetchChapters(sourceSeriesId: string, pagination?: Pagination): Promise<ChapterItem[]>;
  fetchChapterContent(sourceChapterId: string): Promise<{ images: string[] } | null>;
  healthCheck(): Promise<ConnectorHealth>;
}