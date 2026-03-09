// app/api/auctions/search/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
    const take = Math.min(24, Math.max(1, Number(url.searchParams.get("take") ?? 12) || 12));
    const skip = (page - 1) * take;

    const now = new Date();

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
              { city: { contains: q, mode: "insensitive" as const } },
              { badgeLabel: { contains: q, mode: "insensitive" as const } },
              { auctionTypeLabel: { contains: q, mode: "insensitive" as const } },
              { companyName: { contains: q, mode: "insensitive" as const } },
              { product: { title: { contains: q, mode: "insensitive" as const } } },
              { product: { description: { contains: q, mode: "insensitive" as const } } },
            ],
          };

    const [auctions, total] = await Promise.all([
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
          badgeLabel: true,
          badgeCount: true,
          companyLogoUrl: true,
          status: true,
          product: { select: { title: true, imageUrl: true } },
        },
      }),
      prisma.auction.count({ where }),
    ]);

    return NextResponse.json(
      { q, page, take, total, auctions },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/auctions/search error:", err);
    return NextResponse.json({ error: "Failed to search auctions" }, { status: 500 });
  }
}
