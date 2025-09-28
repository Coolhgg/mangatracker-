export function sanitizeComment(input: string): string {
  if (!input) return "";
  // Remove script/style tags and any HTML tags
  const withoutTags = input
    .replace(/<\/(script|style)>/gi, "")
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/(script|style)>/gi, "")
    .replace(/<[^>]+>/g, "");

  // Collapse whitespace and trim
  const collapsed = withoutTags.replace(/\s+/g, " ").trim();

  // Enforce a sane maximum length
  const MAX_LEN = 5000;
  return collapsed.length > MAX_LEN ? collapsed.slice(0, MAX_LEN) : collapsed;
}

// Add a generic length-bounded sanitizer used by comments/threads routes
export function sanitizeLen(input: string, maxLen: number): string {
  const safe = sanitizeComment(String(input ?? ""));
  const cap = Math.max(0, Number.isFinite(maxLen) ? Number(maxLen) : 0);
  return cap > 0 ? safe.slice(0, cap) : safe;
}