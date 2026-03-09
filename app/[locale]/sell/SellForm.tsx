"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Cat = { id: string; slug: string; nameAr: string; nameEn: string };

type CountryOption = {
  code: string; 
  nameAr: string;
  nameEn: string;
  cities: { ar: string; en: string }[];
};


const COUNTRIES: CountryOption[] = [
  {
    code: "SA",
    nameAr: "السعودية",
    nameEn: "Saudi Arabia",
    cities: [
      { ar: "الرياض", en: "Riyadh" },
      { ar: "جدة", en: "Jeddah" },
      { ar: "الدمام", en: "Dammam" },
      { ar: "مكة", en: "Makkah" },
      { ar: "المدينة", en: "Madinah" },
    ],
  },
  {
    code: "AE",
    nameAr: "الإمارات",
    nameEn: "United Arab Emirates",
    cities: [
      { ar: "دبي", en: "Dubai" },
      { ar: "أبوظبي", en: "Abu Dhabi" },
      { ar: "الشارقة", en: "Sharjah" },
    ],
  },
  {
    code: "EG",
    nameAr: "مصر",
    nameEn: "Egypt",
    cities: [
      { ar: "القاهرة", en: "Cairo" },
      { ar: "الإسكندرية", en: "Alexandria" },
      { ar: "الجيزة", en: "Giza" },
    ],
  },
  {
    code: "QA",
    nameAr: "قطر",
    nameEn: "Qatar",
    cities: [{ ar: "الدوحة", en: "Doha" }],
  },
  {
    code: "KW",
    nameAr: "الكويت",
    nameEn: "Kuwait",
    cities: [{ ar: "مدينة الكويت", en: "Kuwait City" }],
  },
];

type UploadResponse =
  | { url: string }
  | { error: string };

type CreateAuctionResponse =
  | { auction: unknown }
  | { error: string };

function countryLabel(c: CountryOption, isArabic: boolean) {
  return isArabic ? c.nameAr : c.nameEn;
}

function cityLabel(city: { ar: string; en: string }, isArabic: boolean) {
  return isArabic ? city.ar : city.en;
}

function isApiError(x: unknown): x is { error: string } {
  return typeof x === "object" && x !== null && "error" in x && typeof (x as { error: unknown }).error === "string";
}

export default function SellForm({
  locale,
  categories,
}: {
  locale: string;
  categories: Cat[];
}) {
  const isArabic = locale === "ar";
  const router = useRouter();

  const TXT = {
    title: isArabic ? "عنوان" : "Title",
    description: isArabic ? "الوصف" : "Description",
    image: isArabic ? "صورة المنتج" : "Product image",
    imageHint: isArabic ? "ارفع صورة من جهازك أو ضع رابطًا" : "Upload from your device or paste a URL",
    imageUrl: isArabic ? "رابط الصورة (اختياري)" : "Image URL (optional)",
    country: isArabic ? "الدولة" : "Country",
    city: isArabic ? "المدينة" : "City",
    category: isArabic ? "التصنيف" : "Category",
    startingPrice: isArabic ? "السعر الابتدائي" : "Starting price",
    durationDays: isArabic ? "عدد الأيام" : "Duration days",
    itemsCount: isArabic ? "عدد المنتجات" : "Items count",
    starts: isArabic ? "يبدأ" : "Starts",
    ends: isArabic ? "ينتهي" : "Ends",
    create: isArabic ? "إنشاء المزاد" : "Create auction",
    creating: isArabic ? "جارٍ الإنشاء..." : "Creating...",
    errors: {
      chooseCategory: isArabic ? "اختار التصنيف" : "Choose a category",
      chooseCountry: isArabic ? "اختار الدولة" : "Choose a country",
      chooseCity: isArabic ? "اختار المدينة" : "Choose a city",
      imageRequired: isArabic ? "الصورة مطلوبة (ارفع صورة أو ضع رابطًا)." : "Image is required (upload or paste a URL).",
      uploadFailed: isArabic ? "فشل رفع الصورة." : "Image upload failed.",
      failed: isArabic ? "حدث خطأ" : "Something went wrong",
    },
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

 
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(""); // optional url input


  const [countryCode, setCountryCode] = useState<string>("SA");

  const currentCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0],
    [countryCode]
  );

  const cityOptions = useMemo(() => currentCountry.cities, [currentCountry]);

  const [city, setCity] = useState<string>(currentCountry.cities[0]?.en ?? "Riyadh");


  const [startingPrice, setStartingPrice] = useState<number>(100);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [productCount, setProductCount] = useState<number>(1);

  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");

  const [startsAt, setStartsAt] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 16);
  });

  const [endsAt, setEndsAt] = useState<string>(() => {
    const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: isArabic ? c.nameAr : c.nameEn,
      })),
    [categories, isArabic]
  );

  function onChangeCountry(nextCode: string) {
    setCountryCode(nextCode);

    const nextCountry = COUNTRIES.find((c) => c.code === nextCode) ?? COUNTRIES[0];
    const first = nextCountry.cities?.[0];
    setCity(first ? first.en : "Riyadh");
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  }

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data: unknown = await res.json();

    if (!res.ok) {
      if (isApiError(data)) throw new Error(data.error);
      throw new Error(TXT.errors.uploadFailed);
    }

    const ok = data as UploadResponse;
    if ("url" in ok && typeof ok.url === "string") return ok.url;

    throw new Error(TXT.errors.uploadFailed);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!categoryId) return setError(TXT.errors.chooseCategory);
    if (!countryCode) return setError(TXT.errors.chooseCountry);
    if (!city) return setError(TXT.errors.chooseCity);

    // must have either uploaded file OR url
    if (!imageFile && !imageUrl.trim()) return setError(TXT.errors.imageRequired);

    setLoading(true);
    try {
      const startsISO = new Date(startsAt).toISOString();
      const endsISO = new Date(endsAt).toISOString();

      const finalImageUrl = imageFile ? await uploadImage(imageFile) : imageUrl.trim();

      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          imageUrl: finalImageUrl,

          countryCode,
          city,

          startingPrice,
          durationDays,
          productCount,
          categoryId,
          startsAt: startsISO,
          endsAt: endsISO,
        }),
      });

      const data: unknown = await res.json();
      if (!res.ok) {
        if (isApiError(data)) throw new Error(data.error);
        throw new Error(TXT.errors.failed);
      }

      router.push(`/${locale}/auctions`);
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : TXT.errors.failed;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-5"
    >
      {/* Title + Country */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <div className="text-sm font-semibold">{TXT.title}</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            required
          />
        </label>

        <label className="space-y-2">
          <div className="text-sm font-semibold">{TXT.country}</div>
          <select
            value={countryCode}
            onChange={(e) => onChangeCountry(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm bg-white"
            required
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {countryLabel(c, isArabic)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* City + Category */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <div className="text-sm font-semibold">{TXT.city}</div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm bg-white"
            required
          >
            {cityOptions.map((ct) => (
              <option key={ct.en} value={ct.en}>
                {cityLabel(ct, isArabic)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <div className="text-sm font-semibold">{TXT.category}</div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm bg-white"
            required
          >
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Description */}
      <label className="space-y-2 block">
        <div className="text-sm font-semibold">{TXT.description}</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
          rows={4}
          required
        />
      </label>

   
      <div className="space-y-3">
        <div className="text-sm font-semibold">{TXT.image}</div>
        <p className="text-xs text-slate-500">{TXT.imageHint}</p>

        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
        />

        {imagePreview && (
          <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
           
            <Image src={imagePreview} alt="Preview" fill unoptimized className="object-cover" />
          </div>
        )}

        <label className="space-y-2 block">
          <div className="text-xs font-semibold text-slate-600">{TXT.imageUrl}</div>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            placeholder="/uploads/example.jpg أو https://..."
          />
        </label>
      </div>

 
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <div className="text-sm font-semibold">{TXT.startingPrice}</div>
          <input
            type="number"
            min={1}
            value={startingPrice}
            onChange={(e) => setStartingPrice(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            required
          />
        </label>

        <label className="space-y-2">
          <div className="text-sm font-semibold">{TXT.durationDays}</div>
          <input
            type="number"
            min={1}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            required
          />
        </label>
      </div>


      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <div className="text-sm font-semibold">{TXT.itemsCount}</div>
          <input
            type="number"
            min={1}
            value={productCount}
            onChange={(e) => setProductCount(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            required
          />
        </label>

        <div className="grid gap-4 grid-cols-2">
          <label className="space-y-2">
            <div className="text-sm font-semibold">{TXT.starts}</div>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="space-y-2">
            <div className="text-sm font-semibold">{TXT.ends}</div>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? TXT.creating : TXT.create}
      </button>
    </form>
  );
}
