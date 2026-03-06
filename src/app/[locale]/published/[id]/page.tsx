import { Render } from "@puckeditor/core";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { buildPuckConfig, normalizePuckData } from "@/components/builder/puck-runtime";
import {
  getProjectById,
  listComponentBlocks,
  listComponents,
} from "@/lib/studio-store";

type Params = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function PublishedPage({ params }: Params) {
  const { locale, id } = await params;

  const [project, components, blocks] = await Promise.all([
    getProjectById(id),
    listComponents(),
    listComponentBlocks(locale),
  ]);

  if (!project || project.status !== "published" || project.locale !== locale) {
    notFound();
  }

  const config = buildPuckConfig(components, blocks);
  const data = normalizePuckData(project.content);

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-6 rounded-xl border border-black/10 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Published page
          </p>
          <h1 className="mt-1 text-xl font-semibold text-zinc-900">{project.name}</h1>
        </div>
        <Render config={config} data={data} />
      </main>
    </div>
  );
}
