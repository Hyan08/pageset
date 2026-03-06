import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { PuckEditor } from "@/components/builder/puck-editor";

export default async function BuilderPage() {
  const t = await getTranslations("builder");

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{t("title")}</h1>
        <p className="mt-3 text-zinc-600">{t("description")}</p>

        <div className="mt-8">
          <PuckEditor />
        </div>
      </main>
    </div>
  );
}
