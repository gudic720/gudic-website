// components/profile/EmptyState.tsx
import Link from "next/link";

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaText,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaText?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600 shadow-sm">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1">{description}</p>

      {ctaHref && ctaText && (
        <p className="mt-3">
          <Link href={ctaHref} className="font-semibold text-emerald-700">
            {ctaText}
          </Link>
        </p>
      )}
    </div>
  );
}
