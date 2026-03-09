// app/[locale]/(protected)/profile/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getMyAuctions, getSavedAuctions } from "@/lib/profile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { EmptyState } from "@/components/profile/EmptyState";
import { AuctionGrid } from "@/components/profile/AuctionGrid";
import type { CountdownLabels } from "@/components/AuctionCard";
import { SaveButton } from "@/components/profile/SaveButton";

export const revalidate = 10;

type SearchParams = { tab?: string };

interface Props {
  params: Promise<{ locale: string }>;
  searchParams?: SearchParams | Promise<SearchParams>;
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await Promise.resolve(searchParams);
  const tab = sp?.tab === "saved" ? "saved" : "my";

  const isArabic = locale === "ar";

  const user = await getCurrentUser();
  if (!user) {
    const next = encodeURIComponent(`/${locale}/profile`);
    redirect(`/${locale}/login?next=${next}`);
  }

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

  const [myAuctions, savedAuctions] = await Promise.all([
    getMyAuctions(user.id),
    getSavedAuctions(user.id),
  ]);

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <ProfileHeader isArabic={isArabic} name={user.name} email={user.email} />
          <ProfileTabs locale={locale} active={tab} isArabic={isArabic} />
        </div>
      </section>

      {tab === "my" ? (
        myAuctions.length === 0 ? (
          <EmptyState
            title={isArabic ? "لا توجد مزادات بعد" : "No auctions yet"}
            description={
              isArabic
                ? "ابدأ بإضافة أول منتج وستظهر مزاداتك هنا."
                : "Start by listing your first product — your auctions will appear here."
            }
            ctaHref={`/${locale}/sell`}
            ctaText={isArabic ? "أضف أول منتج" : "List your first product"}
          />
        ) : (
          <AuctionGrid
            locale={locale}
            isArabic={isArabic}
            auctions={myAuctions}
            labels={labels}
            showActions
          />
        )
      ) : savedAuctions.length === 0 ? (
        <EmptyState
          title={isArabic ? "لا توجد مزادات محفوظة" : "No saved auctions"}
          description={
            isArabic
              ? "احفظ أي مزاد يعجبك لتجده هنا بسرعة."
              : "Save auctions you like and they’ll show up here."
          }
          ctaHref={`/${locale}`}
          ctaText={isArabic ? "اذهب للمزادات" : "Browse auctions"}
        />
      ) : (
        <AuctionGrid
          locale={locale}
          isArabic={isArabic}
          auctions={savedAuctions}
          labels={labels}
          rightSlot={(auctionId) => (
            <SaveButton auctionId={auctionId} initialSaved={true} variant="outline" />
          )}
        />
      )}
    </main>
  );
}
