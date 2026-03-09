"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
};

export type CountdownLabels = {
  timed: string;
  endsIn: string;
  finished: string;
  day: string;
  days: string;
  hour: string;
  hours: string;
  minute: string;
  minutes: string;
  second: string;
  seconds: string;
  currentBid: string;
  auctionEndsAt: string;
  details: string;
};

export type AuctionCardProps = {
  isArabic: boolean;
  title: string;

 
  countryCode: string; 

  city: string;
  imageUrl: string;
  currentPrice: number;
  startsAt: string;
  endsAt: string;
  durationDays: number;
  itemsCount: number;

  hijriDateLabel?: string | null;
  gregorianDateLabel?: string | null;
  startDayTimeLabel?: string | null;

  auctionTypeLabel?: string | null;
  badgeLabel?: string | null;
  badgeCount?: number | null;

  companyLogoUrl?: string | null;

  labels: CountdownLabels;
  status?: "LIVE" | "ENDED" | "DRAFT" | "CANCELLED" | string;

  rightSlot?: React.ReactNode;
};

function getTimeLeft(endsAt: string): TimeLeft {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (!Number.isFinite(end) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, finished: false };
}


const FLAG_SVGS: Record<string, string> = {
 
  SA: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
  <rect width="60" height="40" fill="#006C35"/>
  <!-- simple white band (stylized shahada area) -->
  <rect x="10" y="12" width="40" height="8" rx="2" fill="#ffffff" opacity="0.95"/>
  <!-- sword -->
  <path d="M15 28 h28 c2 0 3 1 3 2 s-1 2-3 2 H15 c-1 0-2-1-2-2 s1-2 2-2z" fill="#fff"/>
  <circle cx="13.5" cy="30" r="2" fill="#fff"/>
</svg>`,

  // UAE
  AE: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
  <rect width="60" height="40" fill="#fff"/>
  <rect width="15" height="40" fill="#CE1126"/>
  <rect x="15" width="45" height="13.333" fill="#00732F"/>
  <rect x="15" y="13.333" width="45" height="13.333" fill="#fff"/>
  <rect x="15" y="26.666" width="45" height="13.334" fill="#000"/>
</svg>`,

  // Egypt
  EG: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
  <rect width="60" height="13.333" y="0" fill="#CE1126"/>
  <rect width="60" height="13.333" y="13.333" fill="#fff"/>
  <rect width="60" height="13.334" y="26.666" fill="#000"/>
  <!-- small emblem hint -->
  <circle cx="30" cy="20" r="3" fill="#CDA434"/>
</svg>`,

  // Qatar
  QA: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
  <rect width="60" height="40" fill="#8D1B3D"/>
  <path d="M0 0 H20 L26 4 L20 8 L26 12 L20 16 L26 20 L20 24 L26 28 L20 32 L26 36 L20 40 H0z" fill="#fff"/>
</svg>`,

  // Kuwait
  KW: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
  <rect width="60" height="13.333" y="0" fill="#007A3D"/>
  <rect width="60" height="13.333" y="13.333" fill="#fff"/>
  <rect width="60" height="13.334" y="26.666" fill="#CE1126"/>
  <path d="M0 0 H18 L26 8 V32 L18 40 H0z" fill="#000"/>
</svg>`,
};

function flagDataUrl(code: string) {
  const c = (code || "").trim().toUpperCase();
  const svg = FLAG_SVGS[c];
  if (!svg) return null;
  // encode svg safely
  const encoded = encodeURIComponent(svg.trim())
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export function AuctionCard(props: AuctionCardProps) {
  const {
    isArabic,
    title,
    countryCode,
    city,
    imageUrl,
    currentPrice,
    endsAt,
    durationDays,
    itemsCount,
    hijriDateLabel,
    gregorianDateLabel,
    startDayTimeLabel,
    auctionTypeLabel,
    badgeLabel,
    badgeCount,
    companyLogoUrl,
    labels,
    status,
    rightSlot,
  } = props;

  const dir = isArabic ? "rtl" : "ltr";

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    finished: false,
  });

  useEffect(() => {
    const tick = () => {
      const next = getTimeLeft(endsAt);
      setTimeLeft(next);
      return next;
    };

    const first = tick();
    if (first.finished) return;

    const id = window.setInterval(() => {
      const next = tick();
      if (next.finished) window.clearInterval(id);
    }, 1000);

    return () => window.clearInterval(id);
  }, [endsAt]);

  const safe = (value: number) => value.toString().padStart(2, "0");
  const formatUnit = (value: number, singular: string, plural: string) =>
    value === 1 ? singular : plural;

  const finished = useMemo(() => {
    if (typeof status === "string" && status.toUpperCase() === "ENDED") return true;
    return timeLeft.finished;
  }, [status, timeLeft.finished]);

  const isDataUrl = !!imageUrl?.startsWith("data:");
  const isLogoDataUrl = !!companyLogoUrl?.startsWith("data:");

  const showBadge = !!badgeLabel?.trim() && typeof badgeCount === "number";

  const typeText =
    auctionTypeLabel?.trim()
      ? auctionTypeLabel
      : isArabic
      ? "مزاد"
      : "Auction";

  const flagSrc = flagDataUrl(countryCode);

  return (
    <article
      dir={dir}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        finished ? "opacity-95" : ""
      }`}
    >
      {/* IMAGE */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-900">
        <Image
          src={imageUrl}
          alt={title}
          width={800}
          height={500}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={isDataUrl}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
            finished ? "grayscale-[35%]" : ""
          }`}
        />

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />

        {rightSlot && (
          <div className={`absolute top-3 ${isArabic ? "right-3" : "left-3"} z-20`}>
            {rightSlot}
          </div>
        )}

        {showBadge && (
          <div className="absolute top-3 left-1/2 z-20 flex -translate-x-1/2 items-center rounded-full bg-black/65 px-4 py-1 text-[11px] text-white shadow-md backdrop-blur">
            <span className="opacity-80">{badgeLabel}</span>
            <span className="mx-1 text-xs">•</span>
            <span className="text-base font-semibold tabular-nums">{badgeCount}</span>
          </div>
        )}

        <div
          className={`absolute top-3 ${isArabic ? "left-3" : "right-3"} z-20 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm`}
        >
          {typeText}
        </div>


        <div
          className={`absolute bottom-3 ${isArabic ? "right-3" : "left-3"} z-20 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm`}
        >
          {flagSrc ? (
            <span className="relative h-4 w-6 overflow-hidden rounded-[4px] ring-1 ring-black/10">
              
              <img
                src={flagSrc}
                alt={countryCode}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </span>
          ) : null}
          <span className="opacity-90">{city}</span>
        </div>

        {finished && (
          <div
            className={`absolute bottom-3 ${
              isArabic ? "left-3" : "right-3"
            } z-20 rounded-full bg-black/65 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur`}
          >
            {isArabic ? "انتهى" : "Ended"}
          </div>
        )}

        <div className="absolute inset-x-5 bottom-12 z-10 text-center text-white drop-shadow">
          <p className="line-clamp-1 text-base font-semibold">{title}</p>
        </div>
      </div>

      {/* BODY */}
      <div className="mx-4 -mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-2 text-center text-[11px] font-semibold text-slate-700">
          {finished ? labels.finished : labels.endsIn}
        </div>

        <div className="grid grid-cols-4 gap-2 px-4 py-3 text-center text-xs text-slate-700">
          {[
            [timeLeft.days, labels.day, labels.days],
            [timeLeft.hours, labels.hour, labels.hours],
            [timeLeft.minutes, labels.minute, labels.minutes],
            [timeLeft.seconds, labels.second, labels.seconds],
          ].map(([val, s, p], i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-2 py-2"
            >
              <span className="text-base font-semibold tabular-nums">
                {safe(val as number)}
              </span>
              <span className="mt-0.5 text-[10px] text-slate-500">
                {formatUnit(val as number, s as string, p as string)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">{labels.currentBid}</span>
            <span className="text-base font-semibold">
              {currentPrice.toLocaleString(isArabic ? "ar-SA" : "en-US")}{" "}
              {isArabic ? "ر.س" : "SAR"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col px-4 pb-4 text-xs text-slate-700">
        <div className="flex items-center justify-between">
          <span>
            {isArabic ? "المدة" : "Duration"} {durationDays}{" "}
            {isArabic ? (durationDays === 1 ? "يوم" : "أيام") : "days"}
          </span>
          <span>
            {itemsCount} {isArabic ? "عنصر" : "items"}
          </span>
        </div>

        {(hijriDateLabel || gregorianDateLabel) && (
          <div className="mt-2 flex flex-col gap-1">
            {hijriDateLabel && (
              <span className="text-[11px] text-slate-500">{hijriDateLabel}</span>
            )}
            {gregorianDateLabel && (
              <span className="text-[11px] text-slate-500">{gregorianDateLabel}</span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-600">{startDayTimeLabel ?? ""}</span>

          {!!companyLogoUrl && (
            <div className="relative h-8 w-16">
              <Image
                src={companyLogoUrl}
                alt="Company logo"
                fill
                unoptimized={isLogoDataUrl}
                className="object-contain"
              />
            </div>
          )}
        </div>

        <div
          className={`mt-4 w-full rounded-full py-2 text-center text-xs font-semibold text-white ${
            finished ? "bg-slate-400" : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {finished ? (isArabic ? "انتهى المزاد" : "Auction ended") : labels.details}
        </div>
      </div>
    </article>
  );
}
