// lib/switchLocalePath.ts
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export function switchLocalePath(
  pathname: string,
  nextLocale: Locale,
  queryString?: string
) {
  const parts = (pathname || "/").split("/");
  const seg1 = parts[1];

  if (seg1 === "en" || seg1 === "ar") {
    parts[1] = nextLocale;
  } else {
    parts.splice(1, 0, nextLocale);
  }

  const newPath = parts.join("/") || `/${nextLocale}`;
  return queryString ? `${newPath}?${queryString}` : newPath;
}
