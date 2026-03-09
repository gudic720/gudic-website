// components/LogoutButton.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function LogoutButton({ locale }: { locale: string }) {
  const [loading, setLoading] = useState(false);


  const t = useTranslations("auth");

  async function handleLogout() {
    if (loading) return;
    setLoading(true);

    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } finally {

      window.location.href = `/${locale}`;
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
    >
      {loading ? t("loggingOut") : t("logout")}
    </button>
  );
}
