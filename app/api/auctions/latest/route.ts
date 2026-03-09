// app/api/auctions/latest/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const now = new Date();

    const auction = await prisma.auction.findFirst({
      where: {
        // If you want the latest uploaded auction that is still relevant:
        // - it can be LIVE or even SCHEDULED (depending on your statuses)
        // - it must not be ended by time
        endsAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        currentPrice: true,
        companyName: true,
        endsAt: true,
        product: { select: { title: true } },
      },
    });

    return NextResponse.json({ auction }, { status: 200 });
  } catch (error) {
    console.error("latest auction error:", error);
    return NextResponse.json(
      { error: "Failed to load latest auction" },
      { status: 500 }
    );
  }
}
