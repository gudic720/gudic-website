// app/[locale]/(protected)/admin/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const t = {
    panel: isAr ? "لوحة الإدارة" : "Admin Panel",
    dashboard: isAr ? "الرئيسية" : "Dashboard",
    users: isAr ? "المستخدمون" : "Users",
    auctions: isAr ? "المزادات" : "Auctions",
    bids: isAr ? "المزايدات" : "Bids",
    settings: isAr ? "الإعدادات" : "Settings",
    adminFallback: isAr ? "مشرف" : "Admin",
  };

  const user = await getCurrentUser();

  // Must be logged in
  if (!user) redirect(`/${locale}/login`);

  // Must be admin
  if (user.role !== "ADMIN") redirect(`/${locale}`);

  return (
    <div className="min-h-screen bg-slate-50" dir={isAr ? "rtl" : "ltr"}>
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin`}
              className="text-sm font-semibold text-slate-900"
            >
              {t.panel}
            </Link>

            <nav className="flex items-center gap-3 text-sm text-slate-600">
              <Link className="hover:text-slate-900" href={`/${locale}/admin`}>
                {t.dashboard}
              </Link>

              <Link
                className="hover:text-slate-900"
                href={`/${locale}/admin/users`}
              >
                {t.users}
              </Link>

              <Link
                className="hover:text-slate-900"
                href={`/${locale}/admin/auctions`}
              >
                {t.auctions}
              </Link>

              <Link
                className="hover:text-slate-900"
                href={`/${locale}/admin/bids`}
              >
                {t.bids}
              </Link>

              <Link
                className="hover:text-slate-900"
                href={`/${locale}/admin/settings`}
              >
                {t.settings}
              </Link>
            </nav>
          </div>

          <div className="text-xs text-slate-600">
            <span className="font-medium text-slate-800">
              {user.name ?? t.adminFallback}
            </span>{" "}
            • {user.email}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
