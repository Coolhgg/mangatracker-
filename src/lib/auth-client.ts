"use client";

import { createAuthClient } from "better-auth/react";
import { useEffect, useState } from "react";

// Compute an absolute base URL for Better Auth (relative URLs are invalid)
const getAuthBaseURL = () => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }
  const fromEnv =
    process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000");
  return `${fromEnv}/api/auth`;
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  fetchOptions: {
    credentials: "include",
    onSuccess: async (ctx) => {
      const h = ctx.response.headers;
      const candidates = [
        h.get("set-auth-token"),
        h.get("authorization"),
        h.get("x-auth-token"),
        h.get("x-better-auth-token"),
        h.get("set-authorization"),
      ].filter(Boolean) as string[];

      let token: string | null = null;
      for (const c of candidates) {
        if (!c) continue;
        const m = c.match(/Bearer\s+(.+)/i);
        token = m ? m[1] : c;
        if (token) break;
      }

      if (token) {
        try {
          localStorage.setItem("bearer_token", token);
          if (typeof document !== "undefined") {
            const isHttps =
              typeof window !== "undefined" &&
              window.location.protocol === "https:";
            const secure = isHttps ? "; Secure" : "";
            const sameSite = "; SameSite=None";
            const maxAge = "; Max-Age=31536000";
            document.cookie = `bearer_token=${token}; Path=/${sameSite}${secure}${maxAge}`;
          }
        } catch {}
      }
    },
  },
});

type SessionData = ReturnType<typeof authClient.useSession>;

export function useSession(): SessionData {
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<any>(null);

  const refetch = () => {
    setIsPending(true);
    setError(null);
    fetchSession();
  };

  const fetchSession = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("bearer_token") || ""
          : "";
      const fetchOptions: any = {
        credentials: "include",
      };
      if (token) {
        fetchOptions.auth = {
          type: "Bearer",
          token,
        };
      }
      const res = await authClient.getSession({
        fetchOptions,
      });
      setSession(res.data);
      setError(null);
    } catch (err) {
      setSession(null);
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    fetchSession();
    return () => {};
  }, []);

  return { data: session, isPending, error, refetch };
}

// Export both default and named for maximum compatibility
export { authClient as default };