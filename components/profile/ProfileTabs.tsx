// components/profile/ProfileTabs.tsx
import Link from "next/link";

export function ProfileTabs({
  locale,
  active,
  isArabic,
}: {
  locale: string;
  active: "my" | "saved";
  isArabic: boolean;
}) {
  const tabCls = (isActive: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold ${
      isActive ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
    }`;

  return (
    <div className="flex items-center gap-2">
      <Link href={`/${locale}/profile?tab=my`} className={tabCls(active === "my")}>
        {isArabic ? "مزاداتي" : "My auctions"}
      </Link>
      <Link
        href={`/${locale}/profile?tab=saved`}
        className={tabCls(active === "saved")}
      >
        {isArabic ? "المحفوظة" : "Saved"}
      </Link>
    </div>
  );
}
