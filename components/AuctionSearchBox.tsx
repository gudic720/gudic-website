"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  locale: "ar" | "en";
  compact?: boolean;
};

export function AuctionSearchBox({ locale, compact }: Props) {
  const router = useRouter();
  const isArabic = locale === "ar";

  const TXT = useMemo(
    () => ({
      placeholder: isArabic ? "ابحث عن مزاد..." : "Search auctions...",
      button: isArabic ? "بحث" : "Search",
      hint: isArabic ? "مثال: عقار، سيارة، الرياض" : "e.g. real estate, car, Riyadh",
    }),
    [isArabic]
  );

  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();


    if (!query) {
      router.push(`/${locale}/search`);
      return;
    }

    router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <div className={`relative ${compact ? "w-44 md:w-64" : "w-full"}`}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={TXT.placeholder}
          className="w-full rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
        />
        {!compact && (
          <p className="mt-1 text-[10px] text-slate-500">{TXT.hint}</p>
        )}
      </div>

      <button
        type="submit"
        className="rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        {TXT.button}
      </button>
    </form>
  );
}
