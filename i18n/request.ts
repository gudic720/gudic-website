// i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "./index";
import type { Locale } from "./index";

export default getRequestConfig(async ({ locale }) => {
  const currentLocale: Locale =
    locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default,
  };
});
