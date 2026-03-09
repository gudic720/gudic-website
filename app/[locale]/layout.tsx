// app/[locale]/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { NavAuthState } from "@/components/NavAuthState";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import type { Locale } from "@/lib/switchLocalePath";
import { AuctionSearchBox } from "@/components/AuctionSearchBox";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = locale === "ar" ? "ar" : "en";
  const isArabic = safeLocale === "ar";

  const title = isArabic ? "سوق المزادات" : "Auction Market";
  const description = isArabic
    ? "منصة مزادات حديثة لرفع المنتجات وبدء المزادات وتلقّي العروض بسهولة."
    : "A modern auction platform to upload products, start auctions, and receive bids easily.";

  const urlPath = `/${safeLocale}`;
  const ogLocale = isArabic ? "ar_SA" : "en_US";

  return {
    title: {
      default: title,
      template: isArabic ? "%s | سوق المزادات" : "%s | Auction Market",
    },
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

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  const safeLocale: Locale = locale === "ar" ? "ar" : "en";
  const isArabic = safeLocale === "ar";

  const messages = await getMessages({ locale: safeLocale });
  const t = await getTranslations({ locale: safeLocale });

  return (
    <NextIntlClientProvider locale={safeLocale} messages={messages}>
      <div
        className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:py-10">
          
          {/* HEADER */}
          <header className="mb-6 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">

              {/* BRAND */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white shadow-sm">
                  AM
                </div>

                <div className={isArabic ? "text-right" : "text-left"}>
                  <p className="text-[12px] font-semibold leading-4 tracking-tight text-slate-900">
                    {t("layout.brand")}
                  </p>
                  <p className="hidden lg:block text-[10.5px] leading-3.5 text-slate-500">
                    {t("layout.tagline")}
                  </p>
                </div>
              </div>

              {/* SEARCH */}
              <div className="hidden lg:block flex-1 max-w-sm">
                <AuctionSearchBox locale={safeLocale} compact />
              </div>

              {/* DESKTOP NAV */}
              <div className="hidden md:flex items-center gap-1.5 text-[12px]">
                <Link
                  href={`/${safeLocale}`}
                  className="rounded-full px-2 py-1 font-medium text-slate-700 hover:bg-slate-100"
                >
                  {t("layout.nav.home")}
                </Link>

                <Link
                  href={`/${safeLocale}/sell`}
                  className="rounded-full px-2 py-1 font-medium text-slate-700 hover:bg-slate-100"
                >
                  {t("layout.nav.sell")}
                </Link>

                <LocaleSwitcher locale={safeLocale} />
                <NavAuthState />
              </div>

            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1">{children}</main>

          {/* FOOTER */}
          <footer className="mt-8 rounded-xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
            <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-start">

              <p className="text-sm text-slate-600">
                © {new Date().getFullYear()} {t("layout.brand")}
              </p>

              <p className="text-sm font-medium text-slate-700">
                {isArabic ? (
                  <>
                    تم تطوير هذا الموقع بواسطة{" "}
                    <a
                      href="https://www.linkedin.com/in/alaa-shalaby-19466526a/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      آلاء شلبي
                    </a>
                  </>
                ) : (
                  <>
                    This website is made by{" "}
                    <a
                      href="https://www.linkedin.com/in/alaa-shalaby-19466526a/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      Alaa Shalaby
                    </a>
                  </>
                )}
              </p>

            </div>
          </footer>

        </div>
      </div>
    </NextIntlClientProvider>
  );
}