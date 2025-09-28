// Lightweight Typesense REST helper without sdk dependency
const TYPESENSE_HOST = process.env.NEXT_PUBLIC_TYPESENSE_HOST;
const TYPESENSE_SEARCH_KEY = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY; // Use search-only key on client

export type TypesenseHit<T> = { document: T; highlight?: any; };

export async function typesenseSearch<T = any>(params: {
  collection: string;
  q: string;
  query_by: string;
  per_page?: number;
}): Promise<{ hits: TypesenseHit<T>[] } | null> {
  if (!TYPESENSE_HOST || !TYPESENSE_SEARCH_KEY) return null;
  const url = `${TYPESENSE_HOST}/collections/${encodeURIComponent(params.collection)}/documents/search`;
  const qs = new URLSearchParams({
    q: params.q,
    query_by: params.query_by,
    per_page: String(params.per_page ?? 10),
  });
  const res = await fetch(`${url}?${qs}`, {
    headers: { "X-TYPESENSE-API-KEY": TYPESENSE_SEARCH_KEY },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}