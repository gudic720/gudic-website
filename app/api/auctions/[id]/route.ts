// app/api/auctions/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { revalidateTag } from "next/cache";

type PatchBody = {
  title?: unknown;
  description?: unknown;
  city?: unknown;

  durationDays?: unknown;
  itemsCount?: unknown;

  auctionTypeLabel?: unknown;
  badgeLabel?: unknown;
  badgeCount?: unknown;
  companyName?: unknown;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: PatchBody = {};
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = toTrimmedString(body.title);
  const description = toTrimmedString(body.description);
  const city = toTrimmedString(body.city);

  const durationDays = toNumber(body.durationDays, 3);
  const itemsCount = toNumber(body.itemsCount, 1);

  const auctionTypeLabel = normalizeNullable(body.auctionTypeLabel);
  const badgeLabel = normalizeNullable(body.badgeLabel);
  const badgeCount = badgeLabel ? normalizeNullableNumber(body.badgeCount) : null;
  const companyName = normalizeNullable(body.companyName);

  if (!title || !description || !city) {
    return NextResponse.json(
      { error: "Title, description, and city are required." },
      { status: 400 }
    );
  }

  const safeDuration = clampInt(durationDays, 1, 30, 3);
  const safeItems = clampInt(itemsCount, 1, 999, 1);
  const safeBadgeCount =
    badgeCount == null ? null : clampInt(badgeCount, 1, 999, 1);

  const owned = await prisma.auction.findFirst({
    where: { id, sellerId: user.id },
    select: { id: true, productId: true },
  });

  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.auction.update({
      where: { id },
      data: {
        city,
        durationDays: safeDuration,
        itemsCount: safeItems,
        auctionTypeLabel,
        badgeLabel,
        badgeCount: safeBadgeCount,
        companyName,
      },
    }),
    prisma.product.update({
      where: { id: owned.productId },
      data: { title, description },
    }),
  ]);

  // ✅ IMPORTANT: invalidate LatestBidCard cache immediately
  revalidateTag("latest-auction", "page");

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await prisma.auction.findFirst({
    where: { id, sellerId: user.id },
    select: { id: true, productId: true },
  });

  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.bid.deleteMany({ where: { auctionId: id } }),
    prisma.savedAuction.deleteMany({ where: { auctionId: id } }),
    prisma.auction.delete({ where: { id } }),
    prisma.product.delete({ where: { id: owned.productId } }),
  ]);

  // ✅ IMPORTANT: invalidate LatestBidCard cache immediately
  revalidateTag("latest-auction", "page");

  return NextResponse.json({ ok: true });
}

/* =========================
   Helpers
========================= */
function toTrimmedString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function toNumber(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function normalizeNullable(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

function normalizeNullableNumber(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

function clampInt(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  const v = Math.trunc(value);
  return Math.max(min, Math.min(max, v));
}
