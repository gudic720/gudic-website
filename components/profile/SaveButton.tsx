"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function SaveButton({
  auctionId,
  initialSaved,
  variant = "default",
  onChange,
  locale,
}: {
  auctionId: string;
  initialSaved: boolean;
  variant?: "default" | "outline";
  onChange?: (nextSaved: boolean) => void;


  locale?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  async function toggle() {
    if (loading) return;
    setLoading(true);

    const next = !saved;
    setSaved(next); 

    try {
      const res = await fetch("/api/saved-auctions", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ auctionId }),
      });

      if (res.status === 401) {
        
        setSaved(!next);
        const loc =
          locale ||
          (pathname?.split("/")?.[1] === "ar" || pathname?.split("/")?.[1] === "en"
            ? pathname.split("/")[1]
            : "en");
        const nextUrl = encodeURIComponent(pathname || `/${loc}`);
        router.push(`/${loc}/login?next=${nextUrl}`);
        return;
      }

      if (!res.ok) {
        setSaved(!next); 
        return;
      }

      onChange?.(next);
    } catch {
      setSaved(!next);
    } finally {
      setLoading(false);
    }
  }

  const cls =
    variant === "outline"
      ? "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      : "rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800";

  return (
    <button
      type="button"
      onClick={(e) => {
        
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      disabled={loading}
      className={cls + " disabled:opacity-60"}
    >
      {loading ? "..." : saved ? "Saved" : "Save"}
    </button>
  );
}
