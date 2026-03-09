// app/[locale]/(protected)/admin/bids/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminBids({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const t = {
    title: isAr ? "المزايدات" : "Bids",
    subtitle: isAr
      ? "أحدث المزايدات عبر جميع المزادات (آخر 100)."
      : "Latest bids across all auctions (last 100).",
    back: isAr ? "العودة للوحة الإدارة" : "Back to Admin",

    table: {
      amount: isAr ? "القيمة" : "Amount",
      auction: isAr ? "المزاد" : "Auction",
      seller: isAr ? "البائع" : "Seller",
      time: isAr ? "الوقت" : "Time",
    },

    labels: {
      untitled: isAr ? "بدون عنوان" : "Untitled",
      viewAuction: isAr ? "عرض المزاد" : "View auction",
      noBids: isAr ? "لا توجد مزايدات حتى الآن." : "No bids yet.",
    },
  };

  const bids = await prisma.bid.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      auction: {
        select: {
          id: true,
          status: true,
          city: true,
          product: { select: { title: true } },
          seller: { select: { email: true, name: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{t.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
          </div>

          <Link
            href={`/${locale}/admin`}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs hover:bg-slate-100"
          >
            {t.back}
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-12 gap-2 border-b bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
          <div className="col-span-2">{t.table.amount}</div>
          <div className="col-span-4">{t.table.auction}</div>
          <div className="col-span-3">{t.table.seller}</div>
          <div className="col-span-3">{t.table.time}</div>
        </div>

        {bids.map((b) => (
          <div
            key={b.id}
            className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-sm text-slate-700 last:border-b-0"
          >
            <div className="col-span-2 font-semibold text-slate-900">
              {b.amount}
            </div>

            <div className="col-span-4">
              <div className="font-medium text-slate-900">
                {b.auction.product?.title ?? t.labels.untitled}
              </div>
              <div className="text-xs text-slate-500">
                {b.auction.city} • {b.auction.status}
              </div>
              <div className="mt-1 text-xs">
                <Link
                  className="underline hover:text-slate-900"
                  href={`/${locale}/auctions/${b.auction.id}`}
                >
                  {t.labels.viewAuction}
                </Link>
              </div>
            </div>

            <div className="col-span-3">
              <div className="font-medium text-slate-900">
                {b.auction.seller?.name ?? "—"}
              </div>
              <div className="text-xs text-slate-600">
                {b.auction.seller?.email}
              </div>
            </div>

            <div className="col-span-3 text-xs text-slate-600">
              {new Date(b.createdAt).toLocaleString()}
            </div>
          </div>
        ))}

        {bids.length === 0 && (
          <div className="p-6 text-sm text-slate-600">{t.labels.noBids}</div>
        )}
      </div>
    </div>
  );
}
