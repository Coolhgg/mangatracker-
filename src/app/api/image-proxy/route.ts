import { NextRequest } from "next/server";

// Allowlist only MangaDex uploads to avoid open proxy abuse
const ALLOWED_HOSTS = new Set(["uploads.mangadex.org", "mangadex.org", "mangadex.network"]);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const src = searchParams.get("src");
    if (!src) {
      return new Response("Missing src", { status: 400 });
    }

    let url: URL;
    try {
      url = new URL(src);
    } catch {
      return new Response("Invalid URL", { status: 400 });
    }

    if (!ALLOWED_HOSTS.has(url.hostname)) {
      return new Response("Host not allowed", { status: 400 });
    }

    // Forward request with a Referer header so MangaDex doesn't return the anti-hotlink image
    const upstream = await fetch(url.toString(), {
      // Don't cache at edge here; rely on downstream headers
      headers: {
        // Pretend request originates from mangadex to satisfy hotlink checks
        Referer: "https://mangadex.org/",
        "User-Agent": "KenmeiLikeProxy/1.0 (+https://your-app.example)",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!upstream.ok) {
      return new Response(`Upstream error: ${upstream.status}`, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const cacheControl = upstream.headers.get("cache-control") || "public, max-age=86400, immutable";

    // Stream the body through to the client
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
      },
    });
  } catch (e) {
    return new Response("Proxy error", { status: 500 });
  }
}