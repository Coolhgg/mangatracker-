"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const RegisterForm = () => {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", passwordConfirm: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    setLoading(true);
    try {
      const { error, data } = await authClient.signUp.email({
        email: form.email,
        name: form.name,
        password: form.password,
      });

      if (error?.code) {
        const map: Record<string, string> = {
          USER_ALREADY_EXISTS: "Email already registered",
          INVALID_EMAIL: "Please enter a valid email address",
          WEAK_PASSWORD: "Password is too weak",
          RATE_LIMITED: "Too many attempts. Please try again later",
        };
        console.error("Registration error:", error);
        toast.error(map[error.code] || `Registration failed: ${error.code}`);
        return;
      }

      // Persist bearer token if backend returns one (defensive)
      const token = (data as any)?.session?.token || (data as any)?.token;
      if (token) {
        try {
          localStorage.setItem("bearer_token", token);
          const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
          document.cookie = `bearer_token=${token}; Path=/; SameSite=Lax${secure}`;
        } catch {}
      }

      toast.success("Account created! Please check your email to verify.");
      router.push("/login?registered=true");
    } catch (err) {
      console.error("Registration exception:", err);
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Create your account</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Already have an account? <a href="/login" className="text-primary underline">Log in</a>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full rounded-md border bg-background px-3 py-2"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              disabled={loading}
            />
          </div>
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="passwordConfirm">Confirm Password</label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              className="w-full rounded-md border bg-background px-3 py-2"
              placeholder="********"
              value={form.passwordConfirm}
              onChange={handleChange}
              required
              autoComplete="off"
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={async () => {
                if (loading) return;
                // Let better-auth handle OAuth callback automatically at /api/auth/callback/google
                // This will redirect to /dashboard after successful authentication
                const { error, data } = await authClient.signIn.social({ 
                  provider: "google",
                  callbackURL: "/dashboard"
                });
                if (error?.code) {
                  console.error("Google sign-in error:", error);
                  toast.error(`Google sign-in failed${error.message ? `: ${error.message}` : ""}`);
                  return;
                }
                // OAuth redirect will happen automatically via data.url
              }}
              className="text-sm text-primary underline"
              disabled={loading}
            >
              Continue with Google
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium hover:opacity-90 transition"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;