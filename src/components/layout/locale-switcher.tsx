"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="inline-flex rounded-full border border-black/10 bg-white p-1">
      {routing.locales.map((value) => {
        const active = value === locale;

        return (
          <button
            key={value}
            className={`rounded-full px-3 py-1 text-xs font-medium uppercase transition ${
              active
                ? "bg-black text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            onClick={() => router.replace(pathname, { locale: value })}
            type="button"
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
