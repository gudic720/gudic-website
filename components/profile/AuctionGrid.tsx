// components/profile/AuctionGrid.tsx
import { AuctionCard, type CountdownLabels } from "@/components/AuctionCard";
import { AuctionActions } from "@/components/profile/AuctionActions";

type AuctionRow = {
  id: string;
  city: string;
  currentPrice: number;
  startsAt: Date;
  endsAt: Date;
  durationDays: number;
  itemsCount: number;

  hijriDateLabel: string | null;
  gregorianDateLabel: string | null;
  startDayTimeLabel: string | null;

  auctionTypeLabel: string | null;
  badgeLabel: string | null;
  badgeCount: number | null;

  companyLogoUrl: string | null;
  status: string;

  product: {
    title: string;
    imageUrl: string;
  };
};

export function AuctionGrid({
  locale,
  isArabic,
  auctions,
  labels,
  rightSlot,
  showActions = false,
}: {
  locale: string;
  isArabic: boolean;
  auctions: AuctionRow[];
  labels: CountdownLabels;

 
  rightSlot?: (auctionId: string) => React.ReactNode;


  showActions?: boolean;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {auctions.map((a) => {
        const slot = showActions ? (
          <AuctionActions locale={locale} auctionId={a.id} isArabic={isArabic} />
        ) : rightSlot ? (
          rightSlot(a.id)
        ) : undefined;

        return (
          <AuctionCard
            key={a.id}
            isArabic={isArabic}
            title={a.product.title}
            city={a.city}
            imageUrl={a.product.imageUrl}
            currentPrice={a.currentPrice}
            startsAt={a.startsAt.toISOString()}
            endsAt={a.endsAt.toISOString()}
            durationDays={a.durationDays}
            itemsCount={a.itemsCount}
            hijriDateLabel={a.hijriDateLabel}
            gregorianDateLabel={a.gregorianDateLabel}
            startDayTimeLabel={a.startDayTimeLabel}
            auctionTypeLabel={a.auctionTypeLabel}
            badgeLabel={a.badgeLabel}
            badgeCount={a.badgeCount}
            companyLogoUrl={a.companyLogoUrl}
            labels={labels}
            status={a.status}
            rightSlot={slot}
          />
        );
      })}
    </section>
  );
}
