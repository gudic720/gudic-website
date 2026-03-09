// app/[locale]/(protected)/admin/users/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/getCurrentUser";
import type { Role } from "@prisma/client";

async function setRoleAction(formData: FormData) {
  "use server";

  const userId = String(formData.get("userId") || "");
  const roleStr = String(formData.get("role") || "");
  const locale = String(formData.get("locale") || "en");

  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") throw new Error("Forbidden");

  if (!userId) throw new Error("Missing userId");
  if (roleStr !== "USER" && roleStr !== "ADMIN") throw new Error("Invalid role");


  if (me.id === userId && roleStr !== "ADMIN") {
    throw new Error("You cannot remove your own admin role.");
  }

  const role: Role = roleStr;

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath(`/${locale}/admin/users`);
}

export default async function AdminUsers({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") throw new Error("Forbidden");

  const t = {
    title: isAr ? "المستخدمون" : "Users",
    subtitle: isAr
      ? "ترقية المستخدم إلى مشرف أو إرجاعه إلى مستخدم عادي، أو حذفه (مع صفحة تأكيد)."
      : "Promote users to Admin, downgrade back to User, or delete them (with confirmation).",
    back: isAr ? "العودة للوحة الإدارة" : "Back to Admin",

    table: {
      user: isAr ? "المستخدم" : "User",
      email: isAr ? "البريد الإلكتروني" : "Email",
      role: isAr ? "الصلاحية" : "Role",
      action: isAr ? "الإجراء" : "Action",
    },

    roles: {
      ADMIN: isAr ? "مشرف" : "ADMIN",
      USER: isAr ? "مستخدم" : "USER",
    },

    buttons: {
      makeUser: isAr ? "اجعل مستخدمًا" : "Make USER",
      makeAdmin: isAr ? "اجعل مشرفًا" : "Make ADMIN",
      delete: isAr ? "حذف" : "Delete",
    },

    labels: {
      empty: isAr ? "لا يوجد مستخدمون." : "No users found.",
      tip: isAr
        ? "نصيحة: أنشئ أول مشرف باستخدام Prisma Studio أو seed script، ثم استخدم هذه الصفحة لإدارة المستخدمين."
        : "Tip: create the first admin using Prisma Studio or a seed script, then use this page to manage other users.",
    },
  };

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-12 gap-2 border-b bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
          <div className="col-span-4">{t.table.user}</div>
          <div className="col-span-4">{t.table.email}</div>
          <div className="col-span-2">{t.table.role}</div>
          <div className="col-span-2 text-right">{t.table.action}</div>
        </div>

        {users.map((u) => {
          const roleLabel = u.role === "ADMIN" ? t.roles.ADMIN : t.roles.USER;

          return (
            <div
              key={u.id}
              className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-sm text-slate-700 last:border-b-0"
            >
              <div className="col-span-4">
                <div className="font-medium text-slate-900">{u.name ?? "—"}</div>
                <div className="text-xs text-slate-500">
                  {new Date(u.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="col-span-4">{u.email}</div>

              <div className="col-span-2">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    u.role === "ADMIN"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {roleLabel}
                </span>

                {isAr && (
                  <div className="mt-1 text-[11px] text-slate-500">DB: {u.role}</div>
                )}
              </div>

              <div className="col-span-2 flex justify-end gap-2">
                {u.role === "ADMIN" ? (
                  <form action={setRoleAction}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="role" value="USER" />
                    <input type="hidden" name="locale" value={locale} />
                    <button
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50"
                      type="submit"
                    >
                      {t.buttons.makeUser}
                    </button>
                  </form>
                ) : (
                  <form action={setRoleAction}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="role" value="ADMIN" />
                    <input type="hidden" name="locale" value={locale} />
                    <button
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      type="submit"
                    >
                      {t.buttons.makeAdmin}
                    </button>
                  </form>
                )}

                <Link
                  href={`/${locale}/admin/users/${u.id}/delete`}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  {t.buttons.delete}
                </Link>
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <div className="p-6 text-sm text-slate-600">{t.labels.empty}</div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        {t.labels.tip}
      </div>
    </div>
  );
}
