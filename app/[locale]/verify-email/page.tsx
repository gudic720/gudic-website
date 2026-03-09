"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token") || "";
  const email = (params.get("email") || "").toLowerCase();

 
  const isArabic = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.location.pathname.startsWith("/ar") || document?.documentElement?.dir === "rtl";
  }, []);

  const t = useMemo(() => {
    return {
      title: isArabic ? "تفعيل البريد الإلكتروني" : "Verify your email",
      verifying: isArabic ? "جاري التحقق..." : "Verifying...",
      success: isArabic ? "تم تفعيل بريدك بنجاح ✅" : "Your email has been verified ✅",
      failed: isArabic ? "فشل التفعيل. الرابط غير صالح أو منتهي." : "Verification failed. Link is invalid or expired.",
      goLogin: isArabic ? "اذهب لتسجيل الدخول" : "Go to login",
      missing: isArabic ? "الرابط غير مكتمل." : "Missing verification data.",
    };
  }, [isArabic]);

  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function run() {
      if (!token || !email) {
        setStatus("error");
        setMsg(t.missing);
        return;
      }

      try {
        const res = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMsg(data.error || t.failed);
          return;
        }

        setStatus("ok");
        setMsg(t.success);
      } catch {
        setStatus("error");
        setMsg(t.failed);
      }
    }

    run();
  }, [token, email, t]);

  return (
    <main dir={isArabic ? "rtl" : "ltr"} className="mx-auto max-w-md p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">{t.title}</h1>

        <p className="mt-3 text-sm text-slate-600">
          {status === "loading" ? t.verifying : msg}
        </p>

        {status !== "loading" && (
          <button
            className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            onClick={() => router.push("/en/login")}
          >
            {t.goLogin}
          </button>
        )}
      </div>
    </main>
  );
}
