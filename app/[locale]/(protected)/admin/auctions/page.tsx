// app/[locale]/(protected)/admin/auctions/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/getCurrentUser";
import type { AuctionStatus } from "@prisma/client";



type EffectiveStatus = AuctionStatus | "SCHEDULED";

function getEffectiveStatus(a: {
  status: AuctionStatus;
  startsAt: Date;
  endsAt: Date;
}): EffectiveStatus {
  if (a.status === "CANCELLED") return "CANCELLED";

  const now = new Date();
  if (a.endsAt <= now) return "ENDED";
  if (a.startsAt > now) return "SCHEDULED";
  return "LIVE";
}



async function cancelAuctionAction(formData: FormData) {
  "use server";

  const auctionId = String(formData.get("auctionId") || "");
  const locale = String(formData.get("locale") || "en");

  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") throw new Error("Forbidden");
  if (!auctionId) throw new Error("Missing auctionId");

  await prisma.auction.update({
    where: { id: auctionId },
    data: { status: "CANCELLED" },
  });

  revalidatePath(`/${locale}/admin/auctions`);
}

async function forceEndAuctionAction(formData: FormData) {
  "use server";

  const auctionId = String(formData.get("auctionId") || "");
  const locale = String(formData.get("locale") || "en");

  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") throw new Error("Forbidden");
  if (!auctionId) throw new Error("Missing auctionId");

  await prisma.auction.update({
    where: { id: auctionId },
    data: { status: "ENDED", endsAt: new Date() },
  });

  revalidatePath(`/${locale}/admin/auctions`);
}

async function deleteAuctionAction(formData: FormData) {
  "use server";

  const auctionId = String(formData.get("auctionId") || "");
  const locale = String(formData.get("locale") || "en");

  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") throw new Error("Forbidden");
  if (!auctionId) throw new Error("Missing auctionId");

  await prisma.savedAuction.deleteMany({ where: { auctionId } });
  await prisma.bid.deleteMany({ where: { auctionId } });

  const auction = await prisma.auction.delete({
    where: { id: auctionId },
    select: { productId: true },
  });

  await prisma.product.delete({ where: { id: auction.productId } });

  revalidatePath(`/${locale}/admin/auctions`);
}



export default async function AdminAuctions({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";



  const t = {
    title: isAr ? "المزادات" : "Auctions",
    subtitle: isAr
      ? "يتم تحديد الحالة حسب وقت البدء والانتهاء مع التعديلات اليدوية."
      : "Status is calculated using time (startsAt / endsAt) + manual overrides.",

    table: {
      auction: isAr ? "المزاد" : "Auction",
      status: isAr ? "الحالة" : "Status",
      seller: isAr ? "البائع" : "Seller",
      bids: isAr ? "المزايدات" : "Bids",
      actions: isAr ? "الإجراءات" : "Actions",
    },

    labels: {
      starts: isAr ? "يبدأ:" : "Starts:",
      ends: isAr ? "ينتهي:" : "Ends:",
      view: isAr ? "عرض" : "View",
      empty: isAr ? "لا توجد مزادات." : "No auctions found.",
    },

    actions: {
      forceEnd: isAr ? "إنهاء الآن" : "Force End",
      cancel: isAr ? "إلغاء" : "Cancel",
      delete: isAr ? "حذف" : "Delete",
    },

    status: {
      LIVE: isAr ? "نشط" : "LIVE",
      ENDED: isAr ? "منتهي" : "ENDED",
      CANCELLED: isAr ? "ملغي" : "CANCELLED",
      DRAFT: isAr ? "مسودة" : "DRAFT",
      SCHEDULED: isAr ? "مجدول" : "SCHEDULED",
    },
  };



  const now = new Date();
  await prisma.auction.updateMany({
    where: { status: "LIVE", endsAt: { lte: now } },
    data: { status: "ENDED" },
  });

  const auctions = await prisma.auction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { title: true } },
      seller: { select: { name: true, email: true } },
      _count: { select: { bids: true } },
    },
  });



  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="rounded-2xl border bg-white p-5">
        <h1 className="text-lg font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
      </div>

      <div className="rounded-2xl border bg-white">
        <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-3 text-xs font-semibold">
          <div className="col-span-4">{t.table.auction}</div>
          <div className="col-span-2">{t.table.status}</div>
          <div className="col-span-3">{t.table.seller}</div>
          <div className="col-span-1">{t.table.bids}</div>
          <div className="col-span-2 text-right">{t.table.actions}</div>
        </div>

        {auctions.map((a) => {
          const effectiveStatus = getEffectiveStatus(a);

          return (
            <div
              key={a.id}
              className="grid grid-cols-12 border-b px-4 py-3 text-sm"
            >
              <div className="col-span-4">
                <div className="font-medium">
                  {a.product?.title ?? "—"}
                </div>
                <div className="text-xs text-slate-500">
                  {t.labels.starts} {new Date(a.startsAt).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">
                  {t.labels.ends} {new Date(a.endsAt).toLocaleString()}
                </div>
                <Link
                  href={`/${locale}/auctions/${a.id}`}
                  className="text-xs underline"
                >
                  {t.labels.view}
                </Link>
              </div>

              <div className="col-span-2">
                {t.status[effectiveStatus]}
              </div>

              <div className="col-span-3">
                <div>{a.seller?.name ?? "—"}</div>
                <div className="text-xs text-slate-500">
                  {a.seller?.email}
                </div>
              </div>

              <div className="col-span-1">{a._count.bids}</div>

              <div className="col-span-2 flex justify-end gap-2">
                {effectiveStatus === "LIVE" && (
                  <>
                    <form action={forceEndAuctionAction}>
                      <input type="hidden" name="auctionId" value={a.id} />
                      <input type="hidden" name="locale" value={locale} />
                      <button className="border px-3 py-2 text-xs rounded">
                        {t.actions.forceEnd}
                      </button>
                    </form>

                    <form action={cancelAuctionAction}>
                      <input type="hidden" name="auctionId" value={a.id} />
                      <input type="hidden" name="locale" value={locale} />
                      <button className="border px-3 py-2 text-xs rounded text-red-600">
                        {t.actions.cancel}
                      </button>
                    </form>
                  </>
                )}

                <form action={deleteAuctionAction}>
                  <input type="hidden" name="auctionId" value={a.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <button className="border px-3 py-2 text-xs rounded">
                    {t.actions.delete}
                  </button>
                </form>
              </div>
            </div>
          );
        })}

        {auctions.length === 0 && (
          <div className="p-6 text-sm text-slate-600">
            {t.labels.empty}
          </div>
        )}
      </div>
    </div>
  );
}
