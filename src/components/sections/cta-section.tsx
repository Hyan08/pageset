import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CtaSection() {
  const t = useTranslations("home.cta");

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="rounded-3xl border border-black/10 bg-zinc-950 p-8 text-white md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h2>
        <p className="mt-3 max-w-3xl text-sm text-zinc-300 md:text-base">
          {t("description")}
        </p>
        <div className="mt-7">
          <Link
            href="/builder"
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
          >
            {t("button")}
          </Link>
        </div>
      </div>
    </section>
  );
}
