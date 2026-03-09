import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getMyAuctionById } from "@/lib/profile";
import { EditAuctionForm } from "./EditAuctionForm";

export const revalidate = 0;

export default async function EditAuctionPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    const next = encodeURIComponent(`/${locale}/profile/auctions/${id}/edit`);
    redirect(`/${locale}/login?next=${next}`);
  }

  const auction = await getMyAuctionById(user.id, id);
  if (!auction) notFound();

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Edit auction</h1>
          <p className="text-sm text-slate-600">Update your auction details.</p>
        </div>
      </section>

      <EditAuctionForm locale={locale} auction={auction} />
    </main>
  );
}
