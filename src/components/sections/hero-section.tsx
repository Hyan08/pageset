import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function HeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section id="product" className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16 md:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex rounded-full border border-black/10 bg-white px-4 py-1 text-xs font-medium text-zinc-600">
          {t("badge")}
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-600 md:text-lg">
          {t("subtitle")}
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/builder"
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            {t("primaryCta")}
          </Link>
          <a
            href="#docs"
            className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
          >
            {t("secondaryCta")}
          </a>
        </div>
      </div>
    </section>
  );
}
