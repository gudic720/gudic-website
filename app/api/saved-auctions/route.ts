// app/api/saved-auctions/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type Body = { auctionId?: string };

async function getUserIdFromCookie() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("auth_token")?.value || cookieStore.get("auth-token")?.value;

  if (!token) return null;

  const payload = verifyAuthToken(token);
  return payload?.userId ?? null;
}

// ✅ POST /api/saved-auctions  { auctionId }
export async function POST(req: Request) {
  const userId = await getUserIdFromCookie();
  if (!userId) return jsonError("Unauthorized", 401);

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const auctionId = (body.auctionId ?? "").trim();
  if (!auctionId) return jsonError("auctionId is required", 400);

  // ensure auction exists
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    select: { id: true },
  });
  if (!auction) return jsonError("Auction not found", 404);

  await prisma.savedAuction.upsert({
    where: { userId_auctionId: { userId, auctionId } },
    update: {},
    create: { userId, auctionId },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

// ✅ DELETE /api/saved-auctions  { auctionId }
export async function DELETE(req: Request) {
  const userId = await getUserIdFromCookie();
  if (!userId) return jsonError("Unauthorized", 401);

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const auctionId = (body.auctionId ?? "").trim();
  if (!auctionId) return jsonError("auctionId is required", 400);

  await prisma.savedAuction.deleteMany({
    where: { userId, auctionId },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
