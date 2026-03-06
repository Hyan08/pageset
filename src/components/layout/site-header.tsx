import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export async function SiteHeader() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-900">
          Flowforge Studio
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
          <a href="#product" className="transition hover:text-zinc-900">
            {t("product")}
          </a>
          <a href="#templates" className="transition hover:text-zinc-900">
            {t("templates")}
          </a>
          <a href="#pricing" className="transition hover:text-zinc-900">
            {t("pricing")}
          </a>
          <a href="#docs" className="transition hover:text-zinc-900">
            {t("docs")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/builder"
            className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
          >
            {t("builder")}
          </Link>
        </div>
      </div>
    </header>
  );
}
