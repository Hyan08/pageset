import { useTranslations } from "next-intl";

const stepKeys = ["step1", "step2", "step3"] as const;

export function WorkflowSection() {
  const t = useTranslations("home.workflow");

  return (
    <section id="docs" className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="rounded-3xl border border-black/10 bg-gradient-to-b from-zinc-50 to-white p-8 md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          {t("title")}
        </h2>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {stepKeys.map((key, index) => (
            <li key={key} className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                {index + 1}
              </div>
              <p className="text-sm leading-6 text-zinc-700">{t(key)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
