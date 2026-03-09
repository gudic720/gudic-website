// app/[locale]/search/page.tsx
import { prisma } from "@/lib/prisma";
import { HomeAuctionCard } from "@/components/home/HomeAuctionCard";
import type { CountdownLabels } from "@/components/AuctionCard";
import { getCurrentUser } from "@/lib/getCurrentUser";

export const revalidate = 0;

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const sp = await searchParams;

  const isArabic = locale === "ar";
  const now = new Date();

  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const take = 12;
  const skip = (page - 1) * take;

  const user = await getCurrentUser().catch(() => null);

  const labels: CountdownLabels = isArabic
    ? {
        timed: "زمني",
        endsIn: "ينتهي خلال",
        finished: "انتهى المزاد",
        day: "يوم",
        days: "أيام",
        hour: "ساعة",
        hours: "ساعات",
        minute: "دقيقة",
        minutes: "دقائق",
        second: "ثانية",
        seconds: "ثواني",
        currentBid: "السعر الحالي",
        auctionEndsAt: "ينتهي في",
        details: "التفاصيل",
      }
    : {
        timed: "Timed",
        endsIn: "Ends in",
        finished: "Auction finished",
        day: "day",
        days: "days",
        hour: "hour",
        hours: "hours",
        minute: "minute",
        minutes: "minutes",
        second: "second",
        seconds: "seconds",
        currentBid: "Current bid",
        auctionEndsAt: "Auction ends at",
        details: "Details",
      };

  const baseWhere = {
    status: "LIVE" as const,
    startsAt: { lte: now },
    endsAt: { gt: now },
  };

  const where =
    q.length === 0
      ? baseWhere
      : {
          ...baseWhere,
          OR: [
            { city: { contains: q } },
            { companyName: { contains: q } },

            
            { badgeLabel: { contains: q } },
            { auctionTypeLabel: { contains: q } },

        
            { badgeLabelAr: { contains: q } },
            { badgeLabelEn: { contains: q } },
            { auctionTypeLabelAr: { contains: q } },
            { auctionTypeLabelEn: { contains: q } },

            { product: { title: { contains: q } } },
            { product: { description: { contains: q } } },
          ],
        };

  const [rows, total] = await Promise.all([
    prisma.auction.findMany({
      where,
      orderBy: { endsAt: "asc" },
      take,
      skip,
      select: {
        id: true,
        city: true,
        currentPrice: true,
        startsAt: true,
        endsAt: true,
        durationDays: true,
        itemsCount: true,

        hijriDateLabel: true,
        gregorianDateLabel: true,
        startDayTimeLabel: true,

        auctionTypeLabel: true,
        auctionTypeLabelAr: true,
        auctionTypeLabelEn: true,

        badgeLabel: true,
        badgeLabelAr: true,
        badgeLabelEn: true,

        badgeCount: true,

        companyLogoUrl: true,
        status: true,

        product: { select: { title: true, imageUrl: true } },

        ...(user
          ? {
              savedBy: {
                where: { userId: user.id },
                select: { id: true },
                take: 1,
              },
            }
          : {}),
      },
    }),
    prisma.auction.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / take));

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <h1 className="text-lg font-semibold">
          {isArabic ? "البحث في المزادات" : "Search auctions"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {q
            ? isArabic
              ? `نتائج البحث عن: "${q}"`
              : `Search results for: "${q}"`
            : isArabic
            ? "اكتب كلمة في مربع البحث بالأعلى للعثور على مزاد."
            : "Type a keyword in the search box above to find an auction."}
        </p>
      </section>

      {q && rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600 shadow-sm">
          {isArabic ? "لا توجد نتائج مطابقة." : "No matching results."}
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((a) => {
            const initialSaved = user ? (a.savedBy?.length ?? 0) > 0 : false;

            const displayBadge =
              (isArabic ? a.badgeLabelAr : a.badgeLabelEn) ?? a.badgeLabel;

            const displayType =
              (isArabic ? a.auctionTypeLabelAr : a.auctionTypeLabelEn) ??
              a.auctionTypeLabel;

            return (
              <li key={a.id}>
                <HomeAuctionCard
                  locale={locale}
                  isArabic={isArabic}
                  labels={labels}
                  auction={{
                    id: a.id,
                    city: a.city,
                    currentPrice: a.currentPrice,
                    startsAtISO: a.startsAt.toISOString(),
                    endsAtISO: a.endsAt.toISOString(),
                    durationDays: a.durationDays,
                    itemsCount: a.itemsCount,
                    hijriDateLabel: a.hijriDateLabel,
                    gregorianDateLabel: a.gregorianDateLabel,
                    startDayTimeLabel: a.startDayTimeLabel,
                    auctionTypeLabel: displayType,
                    badgeLabel: displayBadge,
                    badgeCount: a.badgeCount,
                    companyLogoUrl: a.companyLogoUrl,
                    status: a.status,
                    product: {
                      title: a.product.title,
                      imageUrl: a.product.imageUrl,
                    },
                    initialSaved,
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <span className="text-sm text-slate-600">
            {isArabic ? "صفحة" : "Page"} {page} / {pages}
          </span>
        </div>
      )}
    </main>
  );
}
