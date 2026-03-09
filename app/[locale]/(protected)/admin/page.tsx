// app/[locale]/(protected)/admin/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { AuctionStatus } from "@prisma/client";

type EffectiveStatus = AuctionStatus | "SCHEDULED";

function getEffectiveStatus(a: {
  status: AuctionStatus;
  startsAt: Date;
  endsAt: Date;
}): EffectiveStatus {
  if (a.status === "CANCELLED") return "CANCELLED";

  const now = new Date();
  if (a.endsAt <= now) return "ENDED";
  if (a.startsAt > now) return "SCHEDULED";
  return "LIVE";
}

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const t = {
    title: isAr ? "الرئيسية" : "Dashboard",
    subtitle: isAr
      ? "نظرة عامة على نشاط المنصة."
      : "Overview of your marketplace activity.",

    actions: {
      manageUsers: isAr ? "إدارة المستخدمين" : "Manage Users",
      manageAuctions: isAr ? "إدارة المزادات" : "Manage Auctions",
      viewBids: isAr ? "عرض المزايدات" : "View Bids",
    },

    stats: {
      users: isAr ? "المستخدمون" : "Users",
      auctions: isAr ? "المزادات" : "Auctions",
      products: isAr ? "المنتجات" : "Products",
      bids: isAr ? "المزايدات" : "Bids",
      savedAuctions: isAr ? "المزادات المحفوظة" : "Saved Auctions",
      view: isAr ? "عرض" : "View",
    },

    sections: {
      byStatus: isAr ? "المزادات حسب الحالة" : "Auctions by Status",
      clickToFilter: isAr ? "اضغط للتصفية" : "Click to filter",
      latest: isAr ? "أحدث المزادات" : "Latest Auctions",
      recentActivity: isAr ? "أحدث نشاط على المنصة" : "Recent activity across the site",
      viewAll: isAr ? "عرض الكل" : "View all",
    },

    labels: {
      untitled: isAr ? "بدون عنوان" : "Untitled",
      viewAuction: isAr ? "عرض المزاد" : "View auction",
      noAuctions: isAr ? "لا توجد مزادات حتى الآن." : "No auctions yet.",
      bids: isAr ? "مزايدات" : "bids",
      saved: isAr ? "محفوظ" : "saved",
    },

    status: {
      LIVE: isAr ? "مباشر" : "LIVE",
      DRAFT: isAr ? "مسودة" : "DRAFT",
      ENDED: isAr ? "منتهي" : "ENDED",
      CANCELLED: isAr ? "ملغي" : "CANCELLED",
      SCHEDULED: isAr ? "قادم" : "SCHEDULED",
    },
  };

  const [users, products, auctions, bids, savedAuctions] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.auction.count(),
    prisma.bid.count(),
    prisma.savedAuction.count(),
  ]);

  const statuses: AuctionStatus[] = ["LIVE", "DRAFT", "ENDED", "CANCELLED"];

  const byStatusEntries = await Promise.all(
    statuses.map(async (s) => [s, await prisma.auction.count({ where: { status: s } })] as const)
  );

  const auctionsByStatus = Object.fromEntries(byStatusEntries) as Record<AuctionStatus, number>;

  const latestAuctions = await prisma.auction.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      product: { select: { title: true, imageUrl: true } },
      seller: { select: { name: true, email: true } },
      _count: { select: { bids: true, savedBy: true } },
    },
  });

  const statCard = (label: string, value: number, href?: string) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      {href && (
        <div className="mt-3">
          <Link
            href={href}
            className="text-xs font-semibold text-slate-700 underline hover:text-slate-900"
          >
            {t.stats.view}
          </Link>
        </div>
      )}
    </div>
  );

  const badge = (status: EffectiveStatus) => {
    const cls =
      status === "LIVE"
        ? "bg-emerald-50 text-emerald-700"
        : status === "CANCELLED"
        ? "bg-rose-50 text-rose-700"
        : status === "ENDED"
        ? "bg-slate-100 text-slate-700"
        : status === "SCHEDULED"
        ? "bg-indigo-50 text-indigo-700"
        : "bg-amber-50 text-amber-700";

    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${cls}`}>
        {t.status[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{t.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${locale}/admin/users`}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {t.actions.manageUsers}
            </Link>
            <Link
              href={`/${locale}/admin/auctions`}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {t.actions.manageAuctions}
            </Link>
            <Link
              href={`/${locale}/admin/bids`}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {t.actions.viewBids}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statCard(t.stats.users, users, `/${locale}/admin/users`)}
        {statCard(t.stats.auctions, auctions, `/${locale}/admin/auctions`)}
        {statCard(t.stats.products, products)}
        {statCard(t.stats.bids, bids, `/${locale}/admin/bids`)}
        {statCard(t.stats.savedAuctions, savedAuctions)}
      </div>

      {/* Auctions by status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">{t.sections.byStatus}</h2>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statuses.map((s) => (
            <Link
              key={s}
              href={`/${locale}/admin/auctions?status=${s}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100"
            >
              <div className="text-xs font-semibold text-slate-600">{t.status[s]}</div>
              <div className="mt-2 text-xl font-semibold text-slate-900">
                {auctionsByStatus[s] ?? 0}
              </div>
              <div className="mt-2 text-xs text-slate-500">{t.sections.clickToFilter}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest auctions */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">{t.sections.latest}</div>
            <div className="text-xs text-slate-600">{t.sections.recentActivity}</div>
          </div>

          <Link
            href={`/${locale}/admin/auctions`}
            className="text-xs font-semibold text-slate-700 underline hover:text-slate-900"
          >
            {t.sections.viewAll}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-0">
          {latestAuctions.map((a) => {
            const effectiveStatus = getEffectiveStatus(a);

            return (
              <div
                key={a.id}
                className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-sm text-slate-700 last:border-b-0"
              >
                <div className="col-span-5">
                  <div className="font-medium text-slate-900">
                    {a.product?.title ?? t.labels.untitled}
                  </div>
                  <div className="text-xs text-slate-500">
                    {a.city} • {new Date(a.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs">
                    <Link
                      className="underline hover:text-slate-900"
                      href={`/${locale}/auctions/${a.id}`}
                    >
                      {t.labels.viewAuction}
                    </Link>
                  </div>
                </div>

                <div className="col-span-2">
                  {badge(effectiveStatus)}
                  {effectiveStatus !== a.status && (
                    <div className="mt-1 text-[11px] text-slate-500">DB: {a.status}</div>
                  )}
                </div>

                <div className="col-span-3">
                  <div className="font-medium text-slate-900">{a.seller?.name ?? "—"}</div>
                  <div className="text-xs text-slate-600">{a.seller?.email}</div>
                </div>

                <div className="col-span-2 text-right text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-900">{a._count.bids}</span>{" "}
                    {t.labels.bids}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">{a._count.savedBy}</span>{" "}
                    {t.labels.saved}
                  </div>
                </div>
              </div>
            );
          })}

          {latestAuctions.length === 0 && (
            <div className="p-6 text-sm text-slate-600">{t.labels.noAuctions}</div>
          )}
        </div>
      </div>
    </div>
  );
}
