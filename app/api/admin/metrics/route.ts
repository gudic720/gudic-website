// app/api/admin/metrics/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, errorToMessage, errorToStatus } from "@/lib/admin";
import type { AuctionStatus } from "@prisma/client";

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();

    const [usersCount, productsCount, auctionsCount, bidsCount, savedCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.auction.count(),
        prisma.bid.count(),
        prisma.savedAuction.count(),
      ]);

    const statuses: AuctionStatus[] = ["DRAFT", "LIVE", "ENDED", "CANCELLED"];

    const byStatusEntries = await Promise.all(
      statuses.map(async (s) => [s, await prisma.auction.count({ where: { status: s } })] as const)
    );

    const auctionsByStatus = Object.fromEntries(byStatusEntries) as Record<
      AuctionStatus,
      number
    >;

    const latestAuctions = await prisma.auction.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        product: { select: { title: true } },
        seller: { select: { email: true, name: true } },
        _count: { select: { bids: true } },
      },
    });

    return NextResponse.json({
      counts: {
        users: usersCount,
        products: productsCount,
        auctions: auctionsCount,
        bids: bidsCount,
        savedAuctions: savedCount,
      },
      auctionsByStatus,
      latestAuctions,
    });
  } catch (err) {
    return NextResponse.json(
      { error: errorToMessage(err) },
      { status: errorToStatus(err) }
    );
  }
}
