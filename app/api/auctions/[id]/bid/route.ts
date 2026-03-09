// app/api/auctions/[id]/bid/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

type BidBody = {
  increase?: number | string;
  companyName?: string;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getErrorMessage(err: unknown): string | null {
  if (err instanceof Error) return err.message;
  return null;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    // ✅ AUTH (server-side)
    const cookieStore = await cookies();
    const token =
      cookieStore.get("auth_token")?.value ||
      cookieStore.get("auth-token")?.value; // legacy support

    if (!token) return jsonError("You must be logged in to place a bid.", 401);

    const payload = verifyAuthToken(token);
    const userId = payload?.userId;
    if (!userId) return jsonError("Invalid session. Please log in again.", 401);

    // ✅ Ensure bidder exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!userExists) return jsonError("User not found. Please log in again.", 401);

    const { id: auctionId } = await ctx.params;
    if (!auctionId) return jsonError("Missing auction id.", 400);

    // ✅ Parse JSON safely
    let body: BidBody = {};
    try {
      const parsed: unknown = await req.json();
      if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        body = {
          increase:
            typeof obj.increase === "number" || typeof obj.increase === "string"
              ? (obj.increase as number | string)
              : undefined,
          companyName: typeof obj.companyName === "string" ? (obj.companyName as string) : undefined,
        };
      }
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }

    const companyName = (body.companyName ?? "").trim();
    const incRaw = body.increase;
    const inc = Number(incRaw);

    if (!companyName) return jsonError("Company name is required.", 400);

    if (!Number.isFinite(inc) || inc <= 0) {
      return jsonError(`Increase amount is invalid. Received: ${String(incRaw)}`, 400);
    }

    // ✅ Transaction ensures correct price (no race conditions)
    const updatedAuction = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        select: {
          id: true,
          status: true,
          endsAt: true,
          currentPrice: true,
          sellerId: true,
        },
      });

      if (!auction) throw new Error("AUCTION_NOT_FOUND");

      // ✅ Disallow seller bidding on own auction
      if (auction.sellerId === userId) throw new Error("SELF_BID");

      // ✅ Time is source of truth
      const now = new Date();
      if (auction.status !== "LIVE" || now >= auction.endsAt) {
        if (auction.status !== "ENDED") {
          await tx.auction.update({
            where: { id: auction.id },
            data: { status: "ENDED" },
          });
        }
        throw new Error("AUCTION_ENDED");
      }

      const newAmount = Math.floor(auction.currentPrice + inc);

      await tx.bid.create({
        data: {
          auctionId: auction.id,
          amount: newAmount,
          // bidderId: userId, // ✅ enable if exists in schema
        },
      });

      // ✅ IMPORTANT: store latest bidder companyName on the auction
      return tx.auction.update({
        where: { id: auction.id },
        data: {
          currentPrice: newAmount,
          companyName,
        },
        select: {
          id: true,
          currentPrice: true,
          companyName: true,
          endsAt: true,
        },
      });
    });

    return NextResponse.json({ auction: updatedAuction }, { status: 200 });
  } catch (err: unknown) {
    const msg = getErrorMessage(err);

    if (msg === "AUCTION_NOT_FOUND") return jsonError("Auction not found.", 404);
    if (msg === "AUCTION_ENDED") return jsonError("Auction has ended. Bidding is closed.", 400);
    if (msg === "SELF_BID") return jsonError("You cannot bid on your own auction.", 400);

    console.error("BID API ERROR:", err);
    return jsonError("Failed to place bid.", 500);
  }
}
