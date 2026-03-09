// components/ClientNavAuthState.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogoutButton } from "./LogoutButton";

export type User = { id: string; email: string; name: string | null } | null;

export function ClientNavAuthState({
  user,
  loading,
}: {
  user: User;
  loading: boolean;
}) {
  const pathname = usePathname();
  const t = useTranslations("auth");


  const firstSegment = pathname?.split("/")?.[1] || "";
  const locale =
    firstSegment === "en" || firstSegment === "ar" ? firstSegment : "en";

 
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-8 w-16 rounded-full bg-slate-100" />
        <span className="h-8 w-20 rounded-full bg-slate-100" />
      </div>
    );
  }


  if (!user) {
    return (
      <>
        <Link
          href={`/${locale}/login`}
          className="rounded-full px-3 py-1 font-medium text-slate-700 hover:bg-slate-100"
        >
          {t("login")}
        </Link>
        <Link
          href={`/${locale}/register`}
          className="rounded-full bg-slate-900 px-3 py-1 font-medium text-white shadow-sm hover:bg-slate-800"
        >
          {t("register")}
        </Link>
      </>
    );
  }


  return (
    <>
      <span className="text-xs text-slate-600">
        {t("hi")}{" "}
        <span className="font-semibold">{user.name || user.email}</span>
      </span>

      <Link
        href={`/${locale}/profile`}
        className="rounded-full px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
      >
        {t("profile")}
      </Link>

      <LogoutButton locale={locale} />
    </>
  );
}
