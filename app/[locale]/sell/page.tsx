// app/[locale]/sell/page.tsx
import { prisma } from "@/lib/prisma";
import SellForm from "./SellForm";

export const revalidate = 0;


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

export default async function SellPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isArabic = locale === "ar";


  const rawCategories = await prisma.category.findMany({
    where: {
      slug: { in: [...HOME_CATEGORY_SLUGS] },
    },
    select: {
      id: true,
      slug: true,
      nameAr: true,
      nameEn: true,
    },
  });


  const bySlug = new Map(rawCategories.map((c) => [c.slug, c]));
  const categories = HOME_CATEGORY_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c)
  );

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">
          {isArabic ? "إضافة مزاد" : "Create auction"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isArabic
            ? "اختر التصنيف المناسب من القائمة أدناه."
            : "Choose the appropriate category from the list below."}
        </p>
      </section>

      <SellForm locale={locale} categories={categories} />
    </main>
  );
}
