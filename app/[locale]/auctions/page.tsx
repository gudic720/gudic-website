// app/[locale]/auctions/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AuctionCard, type CountdownLabels } from "@/components/AuctionCard";

export const revalidate = 5;

type AuctionsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AuctionsPage({ params, searchParams }: AuctionsPageProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const now = new Date();

 
  const sp = (await searchParams) ?? {};
  const rawCategory = sp.category;

  const categorySlug =
    typeof rawCategory === "string"
      ? rawCategory
      : Array.isArray(rawCategory)
        ? rawCategory[0]
        : undefined;

  const categoryFilter = categorySlug
    ? {
        product: {
          category: {
            slug: categorySlug,
          },
        },
      }
    : {};

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

  const auctions = await prisma.auction.findMany({
    where: {
      status: "LIVE",
      startsAt: { lte: now },
      endsAt: { gt: now },
      ...categoryFilter, 
    },
    orderBy: { endsAt: "asc" },
    take: 24,
    select: {
      id: true,
      countryCode: true, 
      city: true,
      currentPrice: true,
      startsAt: true,
      endsAt: true,
      durationDays: true,
      itemsCount: true,
      status: true,
      product: {
        select: {
          title: true,
          imageUrl: true,
        },
      },
    },
  });

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{isArabic ? "المزادات" : "Auctions"}</h1>

        <Link
          href={`/${locale}/sell`}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {isArabic ? "إنشاء مزاد" : "Create auction"}
        </Link>
      </div>

      {auctions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600">
          {isArabic ? "لا توجد مزادات حالياً." : "No auctions right now."}
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {auctions.map((a) => (
            <li key={a.id} className="h-full">
              <Link href={`/${locale}/auctions/${a.id}`} className="block h-full">
                <AuctionCard
                  isArabic={isArabic}
                  labels={labels}
                  title={a.product.title}
                  imageUrl={a.product.imageUrl}
                  countryCode={a.countryCode ?? ""} 
                  city={a.city}
                  currentPrice={a.currentPrice}
                  startsAt={a.startsAt.toISOString()}
                  endsAt={a.endsAt.toISOString()}
                  durationDays={a.durationDays}
                  itemsCount={a.itemsCount}
                  status={a.status}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
