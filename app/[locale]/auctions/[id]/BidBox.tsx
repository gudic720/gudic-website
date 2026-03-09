// app/[locale]/auctions/[id]/BidBox.tsx
"use client";

import { useMemo, useState } from "react";

interface BidBoxProps {
  auctionId: string;
  initialPrice: number;
  isLive: boolean;
  locale: string; // "en" | "ar"
}

type BidResponse = {
  auction?: { currentPrice: number; companyName?: string | null };
  error?: string;
};

export function BidBox({ auctionId, initialPrice, isLive, locale }: BidBoxProps) {
  const isArabic = locale === "ar";

  const TXT = {
    currentPrice: isArabic ? "السعر الحالي" : "Current price",
    sar: isArabic ? "ر.س" : "SAR",
    companyNameLabel: isArabic ? "اسم الشركة المُزايدة" : "Bidding company name",
    companyNamePlaceholder: isArabic ? "مثال: شركة عقارات الرياض" : "e.g. Riyadh Properties Co.",
    increaseLabel: isArabic ? "زيادة بمقدار (ر.س)" : "Increase by (SAR)",
    placingBid: isArabic ? "جاري تقديم العرض..." : "Placing bid...",
    placeBid: isArabic ? "تقديم عرض" : "Place bid",
    closed: isArabic ? "انتهى المزاد. تم إغلاق المزايدة." : "Auction has ended. Bidding is closed.",
    errors: {
      companyNameRequired: isArabic ? "اسم الشركة مطلوب." : "Company name is required.",
      increasePositive: isArabic ? "يجب أن تكون قيمة الزيادة أكبر من صفر." : "Increase amount must be positive.",
      failedToPlaceBid: isArabic ? "فشل تقديم العرض." : "Failed to place bid.",
      invalidServerResponse: isArabic ? "استجابة غير صالحة من الخادم." : "Invalid server response.",
      networkError: isArabic ? "خطأ في الشبكة. حاول مرة أخرى." : "Network error. Please try again."
    }
  };

  const [companyName, setCompanyName] = useState("");
  const [increase, setIncrease] = useState<number | "">("");
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canBid = useMemo(() => isLive, [isLive]);

  async function handleBid(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canBid) return;

    setError(null);

    const name = companyName.trim();
    if (!name) return setError(TXT.errors.companyNameRequired);

    const inc = typeof increase === "string" ? Number(increase) : increase;
    if (!Number.isFinite(inc) || inc <= 0) return setError(TXT.errors.increasePositive);

    setLoading(true);
    try {
      const res = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increase: inc, companyName: name })
      });

      const data = (await res.json()) as BidResponse;

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/${locale}/login?next=/${locale}/auctions/${auctionId}`;
          return;
        }
        setError(data.error || TXT.errors.failedToPlaceBid);
        return;
      }

      if (!data.auction) return setError(TXT.errors.invalidServerResponse);

      setCurrentPrice(data.auction.currentPrice);
      setIncrease("");
    } catch {
      setError(TXT.errors.networkError);
    } finally {
      setLoading(false);
    }
  }

  if (!canBid) {
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
        {TXT.closed}
      </p>
    );
  }

  return (
    <form onSubmit={handleBid} className="space-y-3">
      <div>
        <p className="text-[11px] uppercase text-slate-500">{TXT.currentPrice}</p>
        <p className="text-2xl font-semibold">
          {currentPrice} <span className="text-sm">{TXT.sar}</span>
        </p>
      </div>

      <div>
        <p className="text-[11px] uppercase text-slate-500">{TXT.companyNameLabel}</p>
        <input
          type="text"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          disabled={loading}
          placeholder={TXT.companyNamePlaceholder}
        />
      </div>

      <div>
        <p className="text-[11px] uppercase text-slate-500">{TXT.increaseLabel}</p>
        <input
          type="number"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          value={increase}
          onChange={(e) => setIncrease(e.target.value === "" ? "" : Number(e.target.value))}
          disabled={loading}
          min={1}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? TXT.placingBid : TXT.placeBid}
      </button>
    </form>
  );
}
