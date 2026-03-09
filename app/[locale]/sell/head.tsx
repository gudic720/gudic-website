// app/[locale]/sell/head.tsx
import { getTranslations } from "next-intl/server";

export default async function Head({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const isArabic = locale === "ar";


  let title = isArabic ? "إضافة مزاد | سوق المزادات" : "Create Auction | Auction Market";
  let description = isArabic
    ? "أضف منتجك وابدأ مزادًا جديدًا بسهولة. ارفع الصور وحدد السعر والمدة والمدينة."
    : "Create a new auction easily. Upload images, set the starting price, duration, and city.";

  try {
    const t = await getTranslations({ locale, namespace: "sellSeo" });
    title = t("title");
    description = t("description");
  } catch {
    
  }

  const canonical = `/${locale}/sell`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />


      <link rel="alternate" hrefLang="ar" href="/ar/sell" />
      <link rel="alternate" hrefLang="en" href="/en/sell" />


      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={isArabic ? "ar_SA" : "en_US"} />


      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      <meta name="robots" content="index,follow" />
    </>
  );
}
