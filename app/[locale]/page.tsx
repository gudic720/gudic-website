// app/[locale]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import LatestBidCard from "@/components/LatestBidCard";
import type { CountdownLabels } from "@/components/AuctionCard";
import { HomeAuctionCard } from "@/components/home/HomeAuctionCard";
import { getCurrentUser } from "@/lib/getCurrentUser";

export const revalidate = 10;

interface HomeProps {
  params: Promise<{ locale: string }>;
}

/* =========================
   SEO (Home)
========================= */
export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const title = isArabic ? "سوق المزادات" : "Auction Market";
  const description = isArabic
    ? "ارفع منتجاتك وابدأ المزادات وتلقَّ العروض بسهولة. تصفح المزادات المباشرة الآن."
    : "Upload products, start auctions, and receive bids easily. Browse live auctions now.";

  const urlPath = `/${locale}`;
  const ogLocale = isArabic ? "ar_SA" : "en_US";

  return {
    title,
    description,
    alternates: {
      canonical: urlPath,
      languages: { ar: "/ar", en: "/en" },
    },
    openGraph: {
      title,
      description,
      url: urlPath,
      siteName: "Auction Market",
      locale: ogLocale,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

type CategoryRow = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
};

type HomeAuctionRow = {
  id: string;

  countryCode: string;
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
    category: {
      id: string;
      slug: string;
      nameAr: string;
      nameEn: string;
    } | null;
  };

  savedBy?: { id: string }[];
};


const PLACEHOLDER_CATEGORY_IMAGE = "/categories/placeholder.png";
function getCategoryImageSrc(slug: string) {

  return `/categories/${slug}.png`;
}


const HOME_CATEGORY_SLUGS = [
  "agricultural-machinery",
  "air-compressors-pneumatic",
  "car-workshop-equipment",
  "cleaning-facility-management",
  "commercial-vehicles",
  "construction-machinery",
  "filling-technology",
  "food-processing",
  "forklifts-industrial-trucks",
  "glass-ceramics-processing",
  "industrial-automation",
  "chemical-pharmaceutical-machinery",
  "mail-processing-equipment",
  "material-handling",

  "measuring-testing-equipment",
  "medical-technology",
  "metal-working",
  "motors",
  "municipal-equipment",
  "office-equipment",
  "other-machinery",
  "overstock-excess-stock",
  "packaging-machinery",
  "paper-cardboard-foils-processing",
  "plastic-processing-machinery",
  "power-engineering-electrical-supplies",
  "power-tools",
  "printing-machinery-presses",

  "process-engineering",
  "propulsion-conveying-technology",
  "refrigeration-cooling-technology",
  "special-purpose-machines",
  "stone-processing-machines",
  "surface-finishing-machines",
  "telecommunication-industrial-computers",
  "textile-processing-fabrication",
  "vacuum-technology",
  "waste-management-recycling",
  "wastewater-treatment-technology",
  "wire-processing-machinery",
  "woodworking",
] as const;



const CATEGORY_FALLBACK: Record<string, { en: string; ar: string }> = {
  "agricultural-machinery": {
    en: "Agricultural machinery",
    ar: "الآلات الزراعية",
  },
  "air-compressors-pneumatic": {
    en: "Air compressors & pneumatic equipment",
    ar: "ضواغط الهواء ومعدات الهواء المضغوط",
  },
  "car-workshop-equipment": {
    en: "Car workshop equipment",
    ar: "معدات ورش السيارات",
  },
  "cleaning-facility-management": {
    en: "Cleaning machines & facility management equipment",
    ar: "آلات التنظيف ومعدات إدارة المرافق",
  },
  "commercial-vehicles": {
    en: "Commercial vehicles",
    ar: "المركبات التجارية",
  },
  "construction-machinery": {
    en: "Construction machinery",
    ar: "معدات وآلات البناء",
  },
  "filling-technology": {
    en: "Filling technology",
    ar: "تقنيات التعبئة",
  },
  "food-processing": {
    en: "Food processing machinery",
    ar: "ماكينات تصنيع الأغذية",
  },
  "forklifts-industrial-trucks": {
    en: "Forklifts & industrial trucks",
    ar: "رافعات شوكية ومركبات صناعية",
  },
  "glass-ceramics-processing": {
    en: "Glass & ceramics processing machinery",
    ar: "ماكينات تصنيع الزجاج والسيراميك",
  },
  "industrial-automation": {
    en: "Industrial automation technology",
    ar: "تقنيات الأتمتة الصناعية",
  },
  "chemical-pharmaceutical-machinery": {
    en: "Machinery for chemical & pharmaceutical industry",
    ar: "ماكينات الصناعات الكيميائية والدوائية",
  },
  "mail-processing-equipment": {
    en: "Mail processing equipment",
    ar: "معدات معالجة البريد",
  },
  "material-handling": {
    en: "Material handling",
    ar: "مناولة المواد",
  },

  "measuring-testing-equipment": {
    en: "Measuring & testing equipment",
    ar: "معدات القياس والاختبار",
  },
  "medical-technology": {
    en: "Medical technology",
    ar: "التكنولوجيا الطبية",
  },
  "metal-working": {
    en: "Metal working machinery & machine tools",
    ar: "ماكينات تشغيل المعادن وأدوات التشغيل",
  },
  motors: {
    en: "Motors",
    ar: "المحركات",
  },
  "municipal-equipment": {
    en: "Municipal equipment",
    ar: "المعدات البلدية",
  },
  "office-equipment": {
    en: "Office equipment",
    ar: "معدات مكتبية",
  },
  "other-machinery": {
    en: "Other machinery",
    ar: "معدات وآلات أخرى",
  },
  "overstock-excess-stock": {
    en: "Overstock & excess stock",
    ar: "مخزون فائض وتصفية",
  },
  "packaging-machinery": {
    en: "Packaging machinery",
    ar: "ماكينات التغليف",
  },
  "paper-cardboard-foils-processing": {
    en: "Paper-, cardboard- & foils processing machinery",
    ar: "ماكينات معالجة الورق والكرتون والرقائق",
  },
  "plastic-processing-machinery": {
    en: "Plastic processing machinery",
    ar: "ماكينات تصنيع ومعالجة البلاستيك",
  },
  "power-engineering-electrical-supplies": {
    en: "Power engineering equipment & electrical supplies",
    ar: "معدات هندسة الطاقة واللوازم الكهربائية",
  },
  "power-tools": {
    en: "Power tools",
    ar: "الأدوات الكهربائية",
  },
  "printing-machinery-presses": {
    en: "Printing machinery & printing presses",
    ar: "ماكينات الطباعة ومطابع الطباعة",
  },

  "process-engineering": {
    en: "Process engineering",
    ar: "هندسة العمليات",
  },
  "propulsion-conveying-technology": {
    en: "Propulsion & conveying technology",
    ar: "تقنيات الدفع والنقل والسيور",
  },
  "refrigeration-cooling-technology": {
    en: "Refrigeration & cooling technology",
    ar: "تقنيات التبريد والتكييف",
  },
  "special-purpose-machines": {
    en: "Special purpose machines",
    ar: "ماكينات للأغراض الخاصة",
  },
  "stone-processing-machines": {
    en: "Stone processing machines",
    ar: "ماكينات معالجة الحجر",
  },
  "surface-finishing-machines": {
    en: "Surface finishing machines",
    ar: "ماكينات تشطيب الأسطح",
  },
  "telecommunication-industrial-computers": {
    en: "Telecommunication technology & industrial computers",
    ar: "تقنيات الاتصالات والحواسيب الصناعية",
  },
  "textile-processing-fabrication": {
    en: "Textile processing & fabrication",
    ar: "معالجة وتصنيع المنسوجات",
  },
  "vacuum-technology": {
    en: "Vacuum technology",
    ar: "تقنيات التفريغ (فاكيوم)",
  },
  "waste-management-recycling": {
    en: "Waste management & recycling equipment",
    ar: "إدارة النفايات ومعدات إعادة التدوير",
  },
  "wastewater-treatment-technology": {
    en: "Wastewater treatment technology",
    ar: "تقنيات معالجة مياه الصرف",
  },
  "wire-processing-machinery": {
    en: "Wire processing machinery",
    ar: "ماكينات معالجة الأسلاك",
  },
  woodworking: {
    en: "Woodworking machinery",
    ar: "ماكينات النجارة",
  },
};


export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const now = new Date();

  const user = await getCurrentUser().catch(() => null);

  const labels: CountdownLabels = isArabic
    ? {
        timed: "زمني",
        endsIn: "ينتهي خلال",
        finished: "انتهى المزاد",
        day: "يوم",
        days: "أيام",
        hour: "ساعة",
        hours: "ساعات",
        minute: "دقيقة",
        minutes: "دقائق",
        second: "ثانية",
        seconds: "ثواني",
        currentBid: "السعر الحالي",
        auctionEndsAt: "ينتهي في",
        details: "التفاصيل",
      }
    : {
        timed: "Timed",
        endsIn: "Ends in",
        finished: "Auction finished",
        day: "day",
        days: "days",
        hour: "hour",
        hours: "hours",
        minute: "minute",
        minutes: "minutes",
        second: "second",
        seconds: "seconds",
        currentBid: "Current bid",
        auctionEndsAt: "Auction ends at",
        details: "Details",
      };

 
  const rawCategories: CategoryRow[] = await prisma.category.findMany({
    where: { slug: { in: [...HOME_CATEGORY_SLUGS] } },
    select: { id: true, slug: true, nameAr: true, nameEn: true },
  });


  const bySlug = new Map(rawCategories.map((c) => [c.slug, c]));
  const categories: CategoryRow[] = HOME_CATEGORY_SLUGS.map((slug) => {
    const found = bySlug.get(slug);
    if (found) return found;

    return {
      id: slug, 
      slug,
      nameEn: CATEGORY_FALLBACK[slug]?.en ?? slug,
      nameAr: CATEGORY_FALLBACK[slug]?.ar ?? slug,
    };
  });


  const auctions: HomeAuctionRow[] = await prisma.auction.findMany({
    where: {
      status: "LIVE",
      startsAt: { lte: now },
      endsAt: { gt: now },
    },
    orderBy: { endsAt: "asc" },
    take: 60,
    select: {
      id: true,
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
      badgeCount: true,

      companyLogoUrl: true,
      status: true,

      product: {
        select: {
          title: true,
          imageUrl: true,
          category: {
            select: { id: true, slug: true, nameAr: true, nameEn: true },
          },
        },
      },

      ...(user
        ? {
            savedBy: {
              where: { userId: user.id },
              select: { id: true },
              take: 1,
            },
          }
        : {}),
    },
  });


  const countBySlug = new Map<string, number>();
  const auctionsBySlug = new Map<string, HomeAuctionRow[]>();

  for (const slug of HOME_CATEGORY_SLUGS) {
    countBySlug.set(slug, 0);
    auctionsBySlug.set(slug, []);
  }

  for (const a of auctions) {
    const slug = a.product.category?.slug;
    if (!slug) continue;
    if (!countBySlug.has(slug)) continue; 
    countBySlug.set(slug, (countBySlug.get(slug) ?? 0) + 1);
    auctionsBySlug.get(slug)!.push(a);
  }

  const categoryHref = (slug: string) =>
    `/${locale}/auctions?category=${encodeURIComponent(slug)}`;

  const totalLiveAuctions = auctions.length;

  const formatCount = (n: number) =>
    isArabic ? n.toLocaleString("ar-SA") : n.toLocaleString("en-US");

  return (
    <main className="space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-emerald-50" />
        <div className="pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -start-24 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="relative grid items-stretch gap-8 p-6 md:grid-cols-[1.4fr,1fr] md:p-8">
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {isArabic ? "مزادات مباشرة الآن" : "Live auctions now"}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {isArabic ? (
                  <>
                    ابدأ{" "}
                    <span className="bg-linear-to-r from-indigo-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                      مزادك
                    </span>{" "}
                    اليوم
                  </>
                ) : (
                  <>
                    Start{" "}
                    <span className="bg-linear-to-r from-indigo-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                      your auction
                    </span>{" "}
                    today
                  </>
                )}
              </h1>

              <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-base">
                {isArabic
                  ? "ارفع منتجاتك خلال دقائق، حدّد مدة المزاد، وابدأ استقبال العروض فوراً."
                  : "List products in minutes, set duration, and start receiving bids instantly."}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
                  {isArabic
                    ? `مزادات مباشرة: ${formatCount(totalLiveAuctions)}`
                    : `Live: ${formatCount(totalLiveAuctions)}`}
                </div>
                <div className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
                  {isArabic ? "تصفّح حسب التصنيف" : "Browse by category"}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/${locale}/sell`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <span className="text-base leading-none">+</span>
                {isArabic ? "أضف منتج" : "List a product"}
              </Link>

              <Link
                href={`/${locale}/auctions`}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white"
              >
                {isArabic ? "تصفّح المزادات" : "Browse auctions"}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
            <LatestBidCard locale={locale} />
          </div>
        </div>
      </section>

  
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{isArabic ? "التصنيفات" : "Categories"}</h2>
            <p className="text-sm text-slate-600">
              {isArabic
                ? "استعرض أهم التصنيفات ومحتواها من المزادات المباشرة."
                : "Browse top categories and what’s inside (live auctions)."}
            </p>
          </div>

          <Link
            href={`/${locale}/auctions`}
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 md:inline-flex"
          >
            {isArabic ? "عرض الكل" : "View all"}
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const name =
              (isArabic ? c.nameAr : c.nameEn) ||
              (isArabic ? CATEGORY_FALLBACK[c.slug]?.ar : CATEGORY_FALLBACK[c.slug]?.en) ||
              c.slug;

            const total = countBySlug.get(c.slug) ?? 0;
            const list = auctionsBySlug.get(c.slug) ?? [];

            const coverSrc = getCategoryImageSrc(c.slug);
            const finalCoverSrc = coverSrc || PLACEHOLDER_CATEGORY_IMAGE;

            return (
              <div
                key={c.slug}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
             
                <div className="relative h-28 w-full bg-slate-100">
                  <Image
                    src={finalCoverSrc}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
                </div>

                {/* content */}
                <div className="p-4">
                  <div className="text-sm font-medium text-slate-500">{formatCount(total)}</div>

                  <Link
                    href={categoryHref(c.slug)}
                    className="mt-0.5 inline-block text-[15px] font-semibold text-blue-700 hover:underline"
                  >
                    {name}
                  </Link>

                  <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-100 bg-white">
                    {list.slice(0, 5).map((a) => (
                      <Link
                        key={a.id}
                        href={`/${locale}/auctions/${a.id}`}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-slate-50"
                      >
                        <span className="min-w-0 truncate text-slate-700">{a.product.title}</span>

                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {formatCount(a.itemsCount)}
                        </span>
                      </Link>
                    ))}

                    <Link
                      href={categoryHref(c.slug)}
                      className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <span>{isArabic ? "المزيد" : "More"}</span>
                      <span className="text-base leading-none">+</span>
                    </Link>
                  </div>

                  {list.length === 0 && (
                    <div className="mt-3 text-sm text-slate-500">
                      {isArabic
                        ? "لا توجد مزادات مباشرة في هذا التصنيف الآن."
                        : "No live auctions in this category right now."}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LIVE AUCTIONS */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{isArabic ? "مزادات مباشرة" : "Live auctions"}</h2>
            <p className="text-sm text-slate-600">
              {isArabic
                ? "أحدث المزادات المتاحة الآن — مرتبة حسب الأقرب انتهاءً."
                : "Currently live auctions — ordered by ending soon."}
            </p>
          </div>

          <Link
            href={`/${locale}/auctions`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            {isArabic ? "عرض كل المزادات" : "View all auctions"}
          </Link>
        </div>

        {auctions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            {isArabic ? "لا يوجد مزادات مباشرة الآن." : "No live auctions right now."}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur md:p-5">
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {auctions.slice(0, 24).map((a) => {
                const initialSaved = user ? (a.savedBy?.length ?? 0) > 0 : false;

                return (
                  <li key={a.id} className="h-full">
                    <HomeAuctionCard
                      locale={locale}
                      isArabic={isArabic}
                      labels={labels}
                      auction={{
                        id: a.id,
                        countryCode: a.countryCode,
                        city: a.city,
                        currentPrice: a.currentPrice,
                        startsAtISO: a.startsAt.toISOString(),
                        endsAtISO: a.endsAt.toISOString(),
                        durationDays: a.durationDays,
                        itemsCount: a.itemsCount,
                        hijriDateLabel: a.hijriDateLabel,
                        gregorianDateLabel: a.gregorianDateLabel,
                        startDayTimeLabel: a.startDayTimeLabel,
                        auctionTypeLabel: a.auctionTypeLabel,
                        badgeLabel: a.badgeLabel,
                        badgeCount: a.badgeCount,
                        companyLogoUrl: a.companyLogoUrl,
                        status: a.status,
                        product: { title: a.product.title, imageUrl: a.product.imageUrl },
                        initialSaved,
                      }}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
