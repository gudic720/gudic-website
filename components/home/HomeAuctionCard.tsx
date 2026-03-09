// components/home/HomeAuctionCard.tsx
"use client";

import Link from "next/link";
import { AuctionCard, type CountdownLabels } from "@/components/AuctionCard";
import { SaveButton } from "@/components/profile/SaveButton";

type HomeAuctionCardProps = {
  locale: string;
  isArabic: boolean;

  auction: {
    id: string;

    countryCode: string; 
    city: string;

    currentPrice: number;
    startsAtISO: string;
    endsAtISO: string;
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

    initialSaved: boolean;
  };

  labels: CountdownLabels;
};

export function HomeAuctionCard({
  locale,
  isArabic,
  auction,
  labels,
}: HomeAuctionCardProps) {
  return (
    <Link href={`/${locale}/auctions/${auction.id}`} className="block h-full" prefetch={false}>
      <AuctionCard
        isArabic={isArabic}
        title={auction.product.title}
        countryCode={auction.countryCode} 
        city={auction.city}
        imageUrl={auction.product.imageUrl}
        currentPrice={auction.currentPrice}
        startsAt={auction.startsAtISO}
        endsAt={auction.endsAtISO}
        durationDays={auction.durationDays}
        itemsCount={auction.itemsCount}
        hijriDateLabel={auction.hijriDateLabel}
        gregorianDateLabel={auction.gregorianDateLabel}
        startDayTimeLabel={auction.startDayTimeLabel}
        auctionTypeLabel={auction.auctionTypeLabel}
        badgeLabel={auction.badgeLabel}
        badgeCount={auction.badgeCount}
        companyLogoUrl={auction.companyLogoUrl}
        labels={labels}
        status={auction.status}
        rightSlot={
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <SaveButton
              auctionId={auction.id}
              initialSaved={auction.initialSaved}
              variant="outline"
            />
          </div>
        }
      />
    </Link>
  );
}
