"use client";

import { useState } from "react";

export const DmcaForm = () => {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [workTitle, setWorkTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; id?: string; error?: string }>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/dmca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          reporter_email: email,
          reporter_name: name || undefined,
          work_title: workTitle || undefined,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, error: data?.error || "Submission failed" });
      } else {
        setResult({ ok: true, id: data?.reportId });
        // reset
        setUrl("");
        setEmail("");
        setName("");
        setWorkTitle("");
        setMessage("");
      }
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium">Infringing URL<span className="text-red-500">*</span></label>
        <input
          type="url"
          required
          placeholder="https://example.com/path-to-content"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-2 w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Your Email<span className="text-red-500">*</span></label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Your Name (optional)</label>
          <input
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Work Title (optional)</label>
        <input
          type="text"
          placeholder="Title of the copyrighted work"
          value={workTitle}
          onChange={(e) => setWorkTitle(e.target.value)}
          className="mt-2 w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description<span className="text-red-500">*</span></label>
        <textarea
          required
          rows={6}
          placeholder="Please describe the copyrighted material and why this content infringes."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting…" : "Submit takedown"}
        </button>
        {result?.ok && (
          <p className="text-sm text-green-600">Submitted. Reference ID: {result.id}</p>
        )}
        {result && !result.ok && (
          <p className="text-sm text-red-600">{result.error}</p>
        )}
      </div>
    </form>
  );
};

export default DmcaForm;