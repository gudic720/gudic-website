"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type AuctionEditDTO = {
  id: string;
  city: string;
  durationDays: number;
  itemsCount: number;
  auctionTypeLabel: string | null;
  badgeLabel: string | null;
  badgeCount: number | null;
  companyName: string | null;
  companyLogoUrl: string | null;
  product: {
    title: string;
    description: string;
    imageUrl: string;
  };
};

export function EditAuctionForm({
  locale,
  auction,
}: {
  locale: string;
  auction: AuctionEditDTO;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(auction.product.title);
  const [description, setDescription] = useState(auction.product.description);
  const [city, setCity] = useState(auction.city);

  const [durationDays, setDurationDays] = useState<number>(auction.durationDays);
  const [itemsCount, setItemsCount] = useState<number>(auction.itemsCount);

  const [auctionTypeLabel, setAuctionTypeLabel] = useState(auction.auctionTypeLabel ?? "");
  const [badgeLabel, setBadgeLabel] = useState(auction.badgeLabel ?? "");
  const [badgeCount, setBadgeCount] = useState<number>(auction.badgeCount ?? 1);

  const [companyName, setCompanyName] = useState(auction.companyName ?? "");

  const safeDuration = useMemo(() => clampInt(durationDays, 1, 30, 3), [durationDays]);
  const safeItems = useMemo(() => clampInt(itemsCount, 1, 999, 1), [itemsCount]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanCity = city.trim();
    const cleanType = auctionTypeLabel.trim();
    const cleanBadge = badgeLabel.trim();
    const cleanCompany = companyName.trim();

    if (!cleanTitle || !cleanDesc || !cleanCity) {
      setLoading(false);
      setError("Please fill title, description, and city.");
      return;
    }

    try {
      const res = await fetch(`/api/auctions/${auction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: cleanTitle,
          description: cleanDesc,
          city: cleanCity,
          durationDays: safeDuration,
          itemsCount: safeItems,
          auctionTypeLabel: cleanType || null,
          badgeLabel: cleanBadge || null,
          badgeCount: cleanBadge ? clampInt(badgeCount, 1, 999, 1) : null,
          companyName: cleanCompany || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Failed to update auction.");
        return;
      }

      router.push(`/${locale}/profile`);
      router.refresh();
    } catch {
      setError("Failed to update auction.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <form onSubmit={onSubmit} className="space-y-5 text-sm">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="block font-medium">Title</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="block font-medium">Description</label>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="block font-medium">City</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium">Duration (days)</label>
            <input
              type="number"
              min={1}
              max={30}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              disabled={loading}
            />
            <p className="text-[11px] text-slate-500">Saved as: {safeDuration}</p>
          </div>

          <div className="space-y-1">
            <label className="block font-medium">Items count</label>
            <input
              type="number"
              min={1}
              max={999}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={itemsCount}
              onChange={(e) => setItemsCount(Number(e.target.value))}
              disabled={loading}
            />
            <p className="text-[11px] text-slate-500">Saved as: {safeItems}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="block font-medium">Auction type</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={auctionTypeLabel}
              onChange={(e) => setAuctionTypeLabel(e.target.value)}
              disabled={loading}
              placeholder="e.g. Timed"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium">Badge label</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={badgeLabel}
              onChange={(e) => setBadgeLabel(e.target.value)}
              disabled={loading}
              placeholder="e.g. Bids"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium">Badge count</label>
            <input
              type="number"
              min={1}
              max={999}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={badgeCount}
              onChange={(e) => setBadgeCount(Number(e.target.value))}
              disabled={loading || badgeLabel.trim().length === 0}
            />
            <p className="text-[11px] text-slate-500">
              {badgeLabel.trim().length === 0 ? "Set badge label to enable." : ""}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block font-medium">Company name</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={loading}
            placeholder="Optional"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

function clampInt(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  const v = Math.trunc(value);
  return Math.max(min, Math.min(max, v));
}
