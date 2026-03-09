// components/LocaleSwitcher.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { switchLocalePath, type Locale } from "@/lib/switchLocalePath";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  const queryString = searchParams?.toString() || "";
  const nextLocale: Locale = locale === "ar" ? "en" : "ar";

  const href = switchLocalePath(pathname, nextLocale, queryString);

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1 py-0.5 text-xs">
      <Link
        href={switchLocalePath(pathname, "en", queryString)}
        className={`rounded-full px-2 py-0.5 font-medium text-slate-700 ${
          locale === "en" ? "bg-white" : "hover:bg-white"
        }`}
      >
        EN
      </Link>

      <Link
        href={switchLocalePath(pathname, "ar", queryString)}
        className={`rounded-full px-2 py-0.5 font-medium text-slate-700 ${
          locale === "ar" ? "bg-white" : "hover:bg-white"
        }`}
      >
        العربية
      </Link>
    </div>
  );
}
