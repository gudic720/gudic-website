// app/[locale]/register/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";

function isValidEmailFormat(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim());
}

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isArabic = locale === "ar";

  const t = useMemo(() => {
    return {
      title: isArabic ? "إنشاء حساب" : "Create account",
      subtitle: isArabic
        ? "سجّل لتبدأ في إضافة المنتجات والمزايدة على المزادات."
        : "Register to start listing products and bidding on auctions.",

      nameLabel: isArabic ? "الاسم" : "Name",
      namePlaceholder: isArabic ? "اسمك" : "Your name",

      emailLabel: isArabic ? "البريد الإلكتروني" : "Email",
      emailPlaceholder: isArabic ? "you@example.com" : "you@example.com",
      emailHint: isArabic
        ? "اكتب بريدًا صحيحًا مثل name@gmail.com"
        : "Enter a valid email like name@gmail.com",

      passwordLabel: isArabic ? "كلمة المرور" : "Password",
      passwordPlaceholder: isArabic ? "••••••••" : "••••••••",
      passwordHint: isArabic ? "8 أحرف على الأقل." : "Minimum 8 characters.",

      submit: isArabic ? "تسجيل" : "Register",
      submitting: isArabic ? "جاري إنشاء الحساب..." : "Creating account...",

      alreadyHave: isArabic ? "لديك حساب بالفعل؟" : "Already have an account?",
      login: isArabic ? "تسجيل الدخول" : "Log in",

      
      errInvalidEmail: isArabic
        ? "من فضلك أدخل بريدًا إلكترونيًا صحيحًا (مثال: name@gmail.com)."
        : "Please enter a valid email (example: name@gmail.com).",
      errPasswordShort: isArabic
        ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل."
        : "Password must be at least 8 characters.",
      errNetwork: isArabic ? "خطأ في الشبكة." : "Network error.",
      errFailed: isArabic ? "فشل إنشاء الحساب." : "Failed to register.",

    
      success: isArabic
        ? "تم إنشاء الحساب. تحقق من بريدك لتفعيل الحساب."
        : "Account created. Please check your email to verify your account.",
    };
  }, [isArabic]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const emailOk = useMemo(() => isValidEmailFormat(email), [email]);
  const canSubmit =
    name.trim().length >= 2 && emailOk && password.length >= 8 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!emailOk) {
      setError(t.errInvalidEmail);
      return;
    }
    if (password.length < 8) {
      setError(t.errPasswordShort);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.errFailed);
        setLoading(false);
        return;
      }

      setSuccess(t.success);
      setLoading(false);

      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(t.errNetwork);
      setLoading(false);
    }
  }

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="mx-auto flex max-w-md flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm"
    >
      <h1 className="text-xl font-semibold tracking-tight">{t.title}</h1>
      <p className="text-sm text-slate-600">{t.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">{t.nameLabel}</label>
          <input
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            required
            minLength={2}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t.emailLabel}</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            required
          />
          {email.length > 0 && !emailOk && (
            <p className="text-xs text-red-600">{t.emailHint}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t.passwordLabel}</label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            required
            minLength={8}
          />
          <p className="text-xs text-slate-500">{t.passwordHint}</p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? t.submitting : t.submit}
        </button>
      </form>

      <p className="text-xs text-slate-600">
        {t.alreadyHave}{" "}
        <a href={`/${locale}/login`} className="font-semibold text-indigo-600">
          {t.login}
        </a>
      </p>
    </main>
  );
}
