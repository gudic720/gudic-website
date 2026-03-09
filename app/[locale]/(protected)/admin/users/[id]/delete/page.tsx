// app/[locale]/(protected)/admin/users/[id]/delete/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { revalidatePath } from "next/cache";

async function deleteUserAction(formData: FormData) {
  "use server";

  const userId = String(formData.get("userId") || "");
  const locale = String(formData.get("locale") || "en");

  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") throw new Error("Forbidden");

  if (!userId) throw new Error("Missing userId");
  if (me.id === userId) throw new Error("You cannot delete your own account.");

  await prisma.$transaction(async (tx) => {

    await tx.savedAuction.deleteMany({ where: { userId } });


    const sellerAuctions = await tx.auction.findMany({
      where: { sellerId: userId },
      select: { id: true },
    });

    const sellerAuctionIds = sellerAuctions.map((a) => a.id);

    if (sellerAuctionIds.length) {
      await tx.bid.deleteMany({
        where: { auctionId: { in: sellerAuctionIds } },
      });
      await tx.savedAuction.deleteMany({
        where: { auctionId: { in: sellerAuctionIds } },
      });
      await tx.auction.deleteMany({
        where: { id: { in: sellerAuctionIds } },
      });
    }

  
    const ownedProducts = await tx.product.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    const ownedProductIds = ownedProducts.map((p) => p.id);

    if (ownedProductIds.length) {
      const auctionsByProducts = await tx.auction.findMany({
        where: { productId: { in: ownedProductIds } },
        select: { id: true },
      });

      const auctionIds = auctionsByProducts.map((a) => a.id);

      if (auctionIds.length) {
        await tx.bid.deleteMany({ where: { auctionId: { in: auctionIds } } });
        await tx.savedAuction.deleteMany({
          where: { auctionId: { in: auctionIds } },
        });
        await tx.auction.deleteMany({ where: { id: { in: auctionIds } } });
      }

      await tx.product.deleteMany({ where: { id: { in: ownedProductIds } } });
    }


    await tx.account.deleteMany({ where: { userId } });
    await tx.session.deleteMany({ where: { userId } });


    await tx.user.delete({ where: { id: userId } });
  });

  revalidatePath(`/${locale}/admin/users`);
  redirect(`/${locale}/admin/users`);
}

export default async function DeleteUserPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === "ar";

  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") throw new Error("Forbidden");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    redirect(`/${locale}/admin/users`);
  }

  const t = {
    title: isAr ? "تأكيد الحذف" : "Confirm deletion",
    subtitle: isAr
      ? "سيتم حذف المستخدم وبياناته (المنتجات/المزادات) نهائيًا."
      : "This will permanently delete the user and their data (products/auctions).",
    back: isAr ? "رجوع" : "Back",
    cancel: isAr ? "إلغاء" : "Cancel",
    confirm: isAr ? "نعم، احذف المستخدم" : "Yes, delete user",
    forbiddenSelf: isAr
      ? "لا يمكنك حذف حسابك."
      : "You cannot delete your own account.",
    userInfo: isAr ? "بيانات المستخدم" : "User info",
    fields: {
      name: isAr ? "الاسم" : "Name",
      email: isAr ? "البريد" : "Email",
      role: isAr ? "الصلاحية" : "Role",
      created: isAr ? "تاريخ الإنشاء" : "Created",
    },
  };

  const isSelf = me.id === user.id;

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{t.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
          </div>

          <Link
            href={`/${locale}/admin/users`}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs hover:bg-slate-100"
          >
            {t.back}
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        {t.subtitle}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">{t.userInfo}</h2>

        <div className="mt-3 grid gap-2 text-sm text-slate-700">
          <div>
            <span className="text-slate-500">{t.fields.name}: </span>
            <span className="font-medium">{user.name ?? "—"}</span>
          </div>
          <div>
            <span className="text-slate-500">{t.fields.email}: </span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div>
            <span className="text-slate-500">{t.fields.role}: </span>
            <span className="font-medium">{user.role}</span>
          </div>
          <div>
            <span className="text-slate-500">{t.fields.created}: </span>
            <span className="font-medium">
              {new Date(user.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {isSelf ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t.forbiddenSelf}
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/${locale}/admin/users`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            {t.cancel}
          </Link>

          <form action={deleteUserAction}>
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              {t.confirm}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
