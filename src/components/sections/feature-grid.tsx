import { useTranslations } from "next-intl";

const featureKeys = [
  ["f1Title", "f1Body"],
  ["f2Title", "f2Body"],
  ["f3Title", "f3Body"],
  ["f4Title", "f4Body"],
] as const;

export function FeatureGrid() {
  const t = useTranslations("home.features");
  const itemT = useTranslations("home.features.items");

  return (
    <section id="templates" className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-3 max-w-3xl text-zinc-600">{t("description")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {featureKeys.map(([titleKey, bodyKey]) => (
          <article
            key={titleKey}
            className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          >
            <h3 className="text-lg font-medium text-zinc-900">{itemT(titleKey)}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{itemT(bodyKey)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
