"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export const LoginForm = () => {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
};

function LoginFormInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data: session, isPending } = useSession();
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && session?.user) {
      const callbackURL = sp.get("redirect") || "/dashboard";
      router.replace(callbackURL);
      router.refresh();
    }
  }, [isPending, session, sp, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const callbackURL = sp.get("redirect") || "/dashboard";
      const result = await authClient.signIn.email({
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe,
        callbackURL,
      });

      const { error, data } = result as any;
      if (error?.code) {
        toast.error("Invalid email or password. Please make sure you are registered.");
        return;
      }

      const token = data?.session?.token || data?.token;
      if (token) {
        try {
          localStorage.setItem("bearer_token", token);
          const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
          document.cookie = `bearer_token=${token}; Path=/; SameSite=Lax${secure}`;
        } catch {}
      }

      toast.success("Welcome back!");
      router.replace(callbackURL);
      router.refresh();
    } catch (err: any) {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Log in</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Don't have an account? <a href="/register" className="text-primary underline">Register</a>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-md border bg-background px-3 py-2"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full rounded-md border bg-background px-3 py-2"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={async () => {
                const callbackURL = typeof window !== "undefined" ? `${window.location.origin}${sp.get("redirect") || "/dashboard"}` : "/dashboard";
                const { error, data } = await authClient.signIn.social({ provider: "google", callbackURL });
                if (error?.code) {
                  toast.error(`Google sign-in failed${error.code ? `: ${error.code}` : ""}`);
                  return;
                }
                if (data?.url) {
                  window.location.href = data.url;
                }
              }}
              className="text-sm text-primary underline"
            >
              Continue with Google
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium hover:opacity-90 transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}