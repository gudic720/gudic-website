// app/[locale]/login/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const nextParam = searchParams.get("next");
  const callbackParam = searchParams.get("callbackUrl");

  const redirectTo = useMemo(() => {
    const fallback = `/${locale}`;
    const raw = nextParam || callbackParam;
    if (!raw) return fallback;
    if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
    return raw;
  }, [locale, nextParam, callbackParam]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data: { error?: string } = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to log in.");
        return;
      }

     
      window.location.href = redirectTo;
    } catch (err) {
      console.error(err);
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return <div className="min-h-[40vh]" />;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <h1 className="text-xl font-semibold tracking-tight">Log in</h1>
      <p className="text-sm text-slate-600">
        Welcome back! Enter your credentials to continue.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-xs text-slate-600">
        Don&apos;t have an account?{" "}
        <a href={`/${locale}/register`} className="font-semibold text-indigo-600">
          Create one
        </a>
      </p>
    </main>
  );
}
