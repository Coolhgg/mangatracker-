// Shared API types for Comments endpoints

export interface Comment {
  id: number;
  // Optional scoping identifiers depending on the endpoint
  seriesId?: number;
  threadId?: number;

  userId: number;
  body: string;

  // ISO 8601 strings per API contract
  createdAt: string;
  updatedAt?: string;

  // Hierarchy and aggregates
  parentId?: number | null;
  repliesCount?: number;

  // Reactions keyed by reaction type (e.g., "like", "love")
  reactions?: Record<string, number>;

  // Denormalized author details commonly sent by APIs for convenience
  username?: string;
  userAvatarUrl?: string;
}

export interface CommentListResponse {
  items: Comment[];
  hasMore: boolean;
}

// Optional: query params representation used on client while building URLs
export interface CommentListQuery {
  seriesId?: string; // kept as string from URLSearchParams
  threadId?: string;
  page?: string | number;
  pageSize?: string | number;
}