import { useTranslations } from "next-intl";

const planKeys = [
  ["starter", "starterDesc", "$19"],
  ["pro", "proDesc", "$79"],
  ["enterprise", "enterpriseDesc", "Custom"],
] as const;

export function PricingSection() {
  const t = useTranslations("home.pricing");

  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
        {t("title")}
      </h2>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {planKeys.map(([nameKey, descKey, price]) => (
          <article
            key={nameKey}
            className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          >
            <h3 className="text-base font-semibold text-zinc-900">{t(nameKey)}</h3>
            <p className="mt-2 text-sm text-zinc-600">{t(descKey)}</p>
            <p className="mt-6 text-2xl font-semibold text-zinc-950">{price}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
