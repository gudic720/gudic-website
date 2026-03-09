"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuctionActions({
  locale,
  auctionId,
  isArabic,
}: {
  locale: string;
  auctionId: string;
  isArabic: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const ok = window.confirm(
      isArabic ? "هل تريد حذف هذا المزاد نهائيًا؟" : "Delete this auction permanently?"
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/auctions/${auctionId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || (isArabic ? "فشل الحذف." : "Delete failed."));
        return;
      }

      router.refresh();
    } catch {
      alert(isArabic ? "حدث خطأ أثناء الحذف." : "Something went wrong while deleting.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      
      <Link
        href={`/${locale}/profile/auctions/${auctionId}/edit`}
        className="relative z-20 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        {isArabic ? "تعديل" : "Edit"}
      </Link>

      <button
        type="button"
        onClick={onDelete}
        disabled={loading}
        className="relative z-20 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
      >
        {loading ? (isArabic ? "جارٍ..." : "Deleting...") : isArabic ? "حذف" : "Delete"}
      </button>
    </div>
  );
}
