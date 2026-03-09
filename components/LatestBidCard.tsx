// components/LatestBidCard.tsx
import Link from "next/link";
import { headers } from "next/headers";

type LatestAuction = {
  id: string;
  currentPrice: number;
  companyName: string | null;
  endsAt: string;
  product: { title: string };
};

function formatEndsAt(endsAt: string, locale: string) {
  const d = new Date(endsAt);
  if (Number.isNaN(d.getTime())) return "";

  const l = locale === "ar" ? "ar-SA" : "en-US";
  try {
    return new Intl.DateTimeFormat(l, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 16).replace("T", " ");
  }
}

async function getLatestAuction(): Promise<LatestAuction | null> {
  const h = await headers();
  const host = h.get("host"); 
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";

  if (!host) return null;

  const res = await fetch(`${proto}://${host}/api/auctions/latest`, {
    cache: "no-store", 
  }).catch(() => null);

  if (!res || !res.ok) return null;

  const data = (await res.json()) as { auction?: LatestAuction | null };
  return data.auction ?? null;
}

export default async function LatestBidCard({ locale }: { locale: string }) {
  const isArabic = locale === "ar";
  const auction = await getLatestAuction();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">
          {isArabic ? "آخر عرض" : "Latest bid"}
        </p>

        <span
          className={`rounded-full px-3 py-1 text-[11px] font-medium ${
            auction ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {auction
            ? isArabic
              ? "مباشر الآن"
              : "Live now"
            : isArabic
            ? "لا توجد مزادات"
            : "No live auctions"}
        </span>
      </div>

      {!auction ? (
        <div className="space-y-2">
          <p className="text-sm text-slate-700">
            {isArabic ? "لا توجد مزادات مباشرة حالياً." : "No live auctions yet."}
          </p>

          <Link
            href={`/${locale}/sell`}
            className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            {isArabic ? "أضف أول منتج" : "List your first product"}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="line-clamp-1 text-base font-semibold text-slate-900">
              {auction.product.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {isArabic ? "ينتهي في: " : "Ends at: "}
              {formatEndsAt(auction.endsAt, locale)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] uppercase text-slate-500">
              {isArabic ? "السعر الحالي" : "Current bid"}
            </p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-2xl font-semibold text-slate-900">
                {auction.currentPrice.toLocaleString(isArabic ? "ar-SA" : "en-US")}{" "}
                <span className="text-sm font-medium text-slate-600">
                  {isArabic ? "ر.س" : "SAR"}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                {auction.companyName
                  ? isArabic
                    ? `بواسطة ${auction.companyName}`
                    : `by ${auction.companyName}`
                  : isArabic
                  ? "لا توجد عروض بعد"
                  : "No bids yet"}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/auctions/${auction.id}`}
            className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {isArabic ? "عرض التفاصيل" : "View details"}
          </Link>
        </div>
      )}
    </div>
  );
}
