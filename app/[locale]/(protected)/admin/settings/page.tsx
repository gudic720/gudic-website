// app/[locale]/(protected)/admin/settings/page.tsx
import Link from "next/link";

export default async function AdminSettings({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const t = {
    title: isAr ? "الإعدادات" : "Settings",
    subtitle: isAr
      ? "إعدادات الإدارة الأساسية وملاحظات التشغيل."
      : "Basic admin settings & operational notes.",
    back: isAr ? "العودة للوحة الإدارة" : "Back to Admin",

    adminSection: {
      title: isAr ? "إدارة حسابات المشرفين" : "Admin account management",
      createAnother: isAr
        ? "لإنشاء مشرف آخر: انتقل إلى"
        : "To create another admin: go to",
      users: isAr ? "المستخدمين" : "Users",
      action: isAr ? "واضغط" : "and click",
      makeAdmin: isAr ? "اجعل مشرفًا" : "Make ADMIN",
      tip: isAr
        ? "نصيحة: لا تقم بإزالة صلاحيات المشرف من حسابك حتى لا تفقد الوصول."
        : "Tip: don’t remove your own admin role to avoid locking yourself out.",
    },
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{t.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
          </div>

          <Link
            href={`/${locale}/admin`}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs hover:bg-slate-100"
          >
            {t.back}
          </Link>
        </div>
      </div>

      {/* Admin accounts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          {t.adminSection.title}
        </h2>

        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <p>
            {t.adminSection.createAnother}{" "}
            <Link
              href={`/${locale}/admin/users`}
              className="font-semibold underline hover:text-slate-900"
            >
              {t.adminSection.users}
            </Link>{" "}
            {t.adminSection.action}{" "}
            <span className="font-semibold">
              {t.adminSection.makeAdmin}
            </span>
            .
          </p>

          <p className="text-slate-600">{t.adminSection.tip}</p>
        </div>
      </div>
    </div>
  );
}
