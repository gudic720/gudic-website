// app/[locale]/auctions/[id]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BidBox } from "./BidBox";

export const revalidate = 5;

/** ✅ Flag emoji from ISO2 (NO fallback) */
function flagEmoji(code: string) {
  const c = (code || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return "";
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + (c.charCodeAt(0) - 65),
    A + (c.charCodeAt(1) - 65)
  );
}

/* =========================
   SEO (Dynamic Auction Page)
========================= */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const safeLocale = locale === "ar" ? "ar" : "en";
  const isArabic = safeLocale === "ar";

  if (!id || typeof id !== "string") {
    return {
      title: isArabic ? "مزاد غير موجود" : "Auction not found",
      robots: { index: false, follow: false },
    };
  }

  const auction = await prisma.auction.findUnique({
    where: { id },
    select: {
      id: true,
      product: {
        select: { title: true, description: true, imageUrl: true },
      },
    },
  });

  if (!auction) {
    return {
      title: isArabic ? "مزاد غير موجود" : "Auction not found",
      robots: { index: false, follow: false },
    };
  }

  const title = isArabic
    ? `${auction.product.title} | مزاد`
    : `${auction.product.title} | Auction`;

  const descriptionRaw = auction.product.description?.trim() || "";
  const description =
    descriptionRaw.length > 160
      ? `${descriptionRaw.slice(0, 157)}...`
      : descriptionRaw;

  const canonical = `/${safeLocale}/auctions/${auction.id}`;
  const ogLocale = isArabic ? "ar_SA" : "en_US";

  const isDataUrl = auction.product.imageUrl?.startsWith("data:");
  const ogImages =
    !isDataUrl && auction.product.imageUrl
      ? [{ url: auction.product.imageUrl, alt: auction.product.title }]
      : undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ar: `/ar/auctions/${auction.id}`,
        en: `/en/auctions/${auction.id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Auction Market",
      locale: ogLocale,
      type: "website",
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AuctionPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  if (!id || typeof id !== "string") notFound();

  const isArabic = locale === "ar";

  const TXT = {
    currentPrice: isArabic ? "السعر الحالي" : "Current price",
    endsAt: isArabic ? "ينتهي في" : "Ends at",
    sar: isArabic ? "ر.س" : "SAR",
    location: isArabic ? "الموقع" : "Location",
    details: isArabic ? "تفاصيل المزاد" : "Auction details",
    ended: isArabic ? "انتهى المزاد" : "Auction ended",
  };

  const auction = await prisma.auction.findUnique({
    where: { id },
    select: {
      id: true,
      currentPrice: true,
      endsAt: true,
      status: true,

      // ✅ NEW
      countryCode: true,
      city: true,

      product: { select: { title: true, description: true, imageUrl: true } },
    },
  });

  if (!auction) notFound();

  const now = new Date();
  const isEndedByTime = now >= auction.endsAt;
  const isLive = !isEndedByTime && auction.status === "LIVE";

  const isDataUrl = !!auction.product.imageUrl?.startsWith("data:");

  const formattedEndsAt = new Intl.DateTimeFormat(isArabic ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(auction.endsAt);

  const flag = flagEmoji(auction.countryCode);

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="grid gap-8 md:grid-cols-[1.6fr,1fr]">
          {/* LEFT */}
          <div className="space-y-4">
            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={auction.product.imageUrl}
                alt={auction.product.title}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                unoptimized={isDataUrl}
                className="object-cover"
              />

              {/* Gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

              {/* Location pill */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                  {flag ? <span className="text-base leading-none">{flag}</span> : null}
                  <span className="opacity-80">{TXT.location}:</span>
                  <span className="truncate">{auction.city}</span>
                </div>

                {isEndedByTime || auction.status === "ENDED" ? (
                  <div className="rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {TXT.ended}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Title + description */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {auction.product.title}
              </h1>

              <p className="text-sm leading-6 text-slate-600">
                {auction.product.description}
              </p>
            </div>

            {/* Details row */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] uppercase text-slate-500">{TXT.endsAt}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formattedEndsAt}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] uppercase text-slate-500">{TXT.location}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800 inline-flex items-center gap-2">
                  {flag ? <span className="text-base leading-none">{flag}</span> : null}
                  <span>{auction.city}</span>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <aside className="space-y-4">
            {/* Price card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] uppercase text-slate-500">{TXT.currentPrice}</p>

              <p className="mt-1 text-3xl font-semibold">
                {isArabic ? (
                  <>
                    {TXT.sar}{" "}
                    <span className="tabular-nums">{auction.currentPrice}</span>
                  </>
                ) : (
                  <>
                    <span className="tabular-nums">{auction.currentPrice}</span>{" "}
                    <span className="text-sm">{TXT.sar}</span>
                  </>
                )}
              </p>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-[11px] uppercase text-slate-500">{TXT.endsAt}</span>
                <span className="text-slate-700">{formattedEndsAt}</span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] uppercase text-slate-500">{TXT.location}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {flag ? <span className="text-base leading-none">{flag}</span> : null}
                  <span>{auction.city}</span>
                </span>
              </div>
            </div>

            {/* BidBox card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <BidBox
                auctionId={auction.id}
                initialPrice={auction.currentPrice}
                isLive={isLive}
                locale={locale}
              />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
