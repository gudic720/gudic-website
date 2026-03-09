// app/[locale]/logout/page.tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function LogoutPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  useEffect(() => {
    async function doLogout() {
      await fetch("/api/logout", { method: "POST", credentials: "include" });

     
      window.location.href = `/${locale}`;
    }
    doLogout();
  }, [locale]);

  return (
    <main className="mx-auto mt-20 text-center text-lg text-slate-600">
      Logging you out...
    </main>
  );
}
