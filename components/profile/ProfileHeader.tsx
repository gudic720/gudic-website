// components/profile/ProfileHeader.tsx
export function ProfileHeader({
  isArabic,
  name,
  email,
}: {
  isArabic: boolean;
  name: string | null;
  email: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-xl font-semibold">
        {isArabic ? "الملف الشخصي" : "Profile"}
      </h1>
      <p className="text-sm text-slate-600">
        {isArabic ? "مرحباً، " : "Hi, "}
        <span className="font-semibold text-slate-900">{name || email}</span>
      </p>
    </div>
  );
}
