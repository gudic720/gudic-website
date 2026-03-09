// lib/profile.ts
import { prisma } from "@/lib/prisma";

export type AuctionCardRow = {
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

export async function getMyAuctions(userId: string) {
  return prisma.auction.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
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
      badgeLabel: true,
      badgeCount: true,
      companyLogoUrl: true,
      status: true,
      product: { select: { title: true, imageUrl: true } },
    },
  });
}

export async function getMyAuctionById(userId: string, auctionId: string) {
  return prisma.auction.findFirst({
    where: { id: auctionId, sellerId: userId },
    select: {
      id: true,
      city: true,
      currentPrice: true,
      startPrice: true,
      startsAt: true,
      endsAt: true,
      durationDays: true,
      itemsCount: true,
      auctionTypeLabel: true,
      badgeLabel: true,
      badgeCount: true,
      companyName: true,
      companyLogoUrl: true,
      status: true,
      product: {
        select: {
          title: true,
          description: true,
          imageUrl: true,
        },
      },
    },
  });
}

export async function getSavedAuctions(userId: string) {
  const rows = await prisma.savedAuction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      auction: {
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
          badgeLabel: true,
          badgeCount: true,
          companyLogoUrl: true,
          status: true,
          product: { select: { title: true, imageUrl: true } },
        },
      },
    },
  });

  return rows.map((row) => row.auction);
}

export async function isAuctionSavedByUser(userId: string, auctionId: string) {
  const row = await prisma.savedAuction.findUnique({
    where: { userId_auctionId: { userId, auctionId } },
    select: { id: true },
  });
  return !!row;
}
