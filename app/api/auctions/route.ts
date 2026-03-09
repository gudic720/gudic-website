// app/api/auctions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

type CreateAuctionBody = {
  title?: string;
  description?: string;
  imageUrl?: string;

  // ✅ NEW
  countryCode?: string;

  city?: string;
  startingPrice?: number | string;
  durationDays?: number | string;
  productCount?: number | string;

  categoryId?: string;

  auctionTypeLabel?: string;
  badgeLabel?: string;

  auctionTypeLabelAr?: string;
  auctionTypeLabelEn?: string;
  badgeLabelAr?: string;
  badgeLabelEn?: string;

  badgeCount?: number | string;
  companyLogoUrl?: string;
  startsAt?: string;
  endsAt?: string;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isAllowedImageUrl(url: string) {
  if (!url) return false;
  if (url.startsWith("/uploads/")) return true;

  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeOptionalUrl(url?: string) {
  const v = (url ?? "").trim();
  if (!v) return null;
  if (!isAllowedImageUrl(v)) return null;
  return v;
}

/**
 * ✅ GET /api/auctions
 */
export async function GET() {
  try {
    const now = new Date();

    const auctions = await prisma.auction.findMany({
      where: { status: "LIVE", endsAt: { gt: now } },
      orderBy: { endsAt: "asc" },
      take: 24,
      select: {
        id: true,

        // ✅ NEW
        countryCode: true,

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

        auctionTypeLabelAr: true,
        auctionTypeLabelEn: true,
        badgeLabelAr: true,
        badgeLabelEn: true,

        badgeCount: true,
        companyLogoUrl: true,
        status: true,

        product: {
          select: {
            title: true,
            imageUrl: true,
            category: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
          },
        },
      },
    });

    return NextResponse.json({ auctions }, { status: 200 });
  } catch (error) {
    console.error("GET /api/auctions error:", error);
    return NextResponse.json({ error: "Failed to load auctions" }, { status: 500 });
  }
}

/**
 * ✅ POST /api/auctions
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("auth_token")?.value || cookieStore.get("auth-token")?.value;

    if (!token) return jsonError("You must be logged in to create an auction.", 401);

    const payload = verifyAuthToken(token);
    const userId = payload?.userId;
    if (!userId) return jsonError("Invalid session. Please log in again.", 401);

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!userExists) return jsonError("User not found. Please log in again.", 401);

    let body: CreateAuctionBody = {};
    try {
      body = (await req.json()) as CreateAuctionBody;
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }

    const title = (body.title ?? "").trim();
    const description = (body.description ?? "").trim();
    const imageUrl = (body.imageUrl ?? "").trim();

    // ✅ NEW
    const countryCode = (body.countryCode ?? "SA").trim().toUpperCase();

    const city = (body.city ?? "").trim();
    const startingPrice = Number(body.startingPrice);
    const durationDaysRaw = Number(body.durationDays ?? 3);
    const productCountRaw = Number(body.productCount ?? 1);

    const badgeCountRaw =
      body.badgeCount == null || body.badgeCount === "" ? null : Number(body.badgeCount);

    const startsAt = body.startsAt ? new Date(body.startsAt) : null;
    const endsAt = body.endsAt ? new Date(body.endsAt) : null;

    const categoryId = (body.categoryId ?? "").trim();

    if (!title || !imageUrl || !city || !categoryId || !countryCode) {
      return jsonError(
        "Missing required fields: title, imageUrl, countryCode, city, categoryId",
        400
      );
    }

    // ✅ ISO2 validation بسيطة
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return jsonError("countryCode must be ISO-2 like SA, AE, EG", 400);
    }

    if (!isAllowedImageUrl(imageUrl)) {
      return jsonError("imageUrl must be a valid /uploads/... path or http(s) URL", 400);
    }

    const companyLogoUrl = normalizeOptionalUrl(body.companyLogoUrl);

    if (!Number.isFinite(startingPrice) || startingPrice <= 0) {
      return jsonError("startingPrice must be a positive number", 400);
    }

    const durationDays = Number.isFinite(durationDaysRaw)
      ? Math.max(1, Math.floor(durationDaysRaw))
      : 3;

    const itemsCount = Number.isFinite(productCountRaw)
      ? Math.max(1, Math.floor(productCountRaw))
      : 1;

    if (!startsAt || Number.isNaN(startsAt.getTime())) return jsonError("startsAt is invalid", 400);
    if (!endsAt || Number.isNaN(endsAt.getTime())) return jsonError("endsAt is invalid", 400);
    if (endsAt <= startsAt) return jsonError("endsAt must be after startsAt", 400);

    const badgeCount =
      badgeCountRaw != null && Number.isFinite(badgeCountRaw)
        ? Math.max(0, Math.floor(badgeCountRaw))
        : null;

    const auctionTypeLabel = (body.auctionTypeLabel ?? "").trim() || null;
    const auctionTypeLabelAr = (body.auctionTypeLabelAr ?? "").trim() || null;
    const auctionTypeLabelEn = (body.auctionTypeLabelEn ?? "").trim() || null;

    const badgeLabel = (body.badgeLabel ?? "").trim() || null;
    const badgeLabelAr = (body.badgeLabelAr ?? "").trim() || null;
    const badgeLabelEn = (body.badgeLabelEn ?? "").trim() || null;

    const cat = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!cat) return jsonError("Invalid categoryId", 400);

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: { title, description, imageUrl, ownerId: userId, categoryId },
        select: { id: true },
      });

      const auction = await tx.auction.create({
        data: {
          productId: product.id,
          sellerId: userId,
          status: "LIVE",
          startPrice: Math.round(startingPrice),
          currentPrice: Math.round(startingPrice),
          startsAt,
          endsAt,

          // ✅ NEW
          countryCode,

          city,
          durationDays,
          itemsCount,

          auctionTypeLabel,
          auctionTypeLabelAr,
          auctionTypeLabelEn,

          badgeLabel,
          badgeLabelAr,
          badgeLabelEn,

          badgeCount,
          companyLogoUrl,
        },
        select: {
          id: true,
          status: true,
          startsAt: true,
          endsAt: true,

          // ✅ NEW
          countryCode: true,

          city: true,
          currentPrice: true,
          durationDays: true,
          itemsCount: true,
          companyLogoUrl: true,

          product: {
            select: {
              title: true,
              imageUrl: true,
              category: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
            },
          },

          auctionTypeLabel: true,
          auctionTypeLabelAr: true,
          auctionTypeLabelEn: true,
          badgeLabel: true,
          badgeLabelAr: true,
          badgeLabelEn: true,
          badgeCount: true,
        },
      });

      return auction;
    });

    return NextResponse.json({ auction: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auctions error:", error);
    return NextResponse.json({ error: "Failed to create auction" }, { status: 500 });
  }
}
