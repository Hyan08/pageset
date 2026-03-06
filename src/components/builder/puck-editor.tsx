"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { useLocale, useTranslations } from "next-intl";
import {
  buildPuckConfig,
  initialDataWithFallback,
  normalizePuckData,
  stripBlockComponentsForBlock,
} from "@/components/builder/puck-runtime";
import type {
  StudioComponentBlock,
  StudioComponentDefinition,
} from "@/lib/studio-types";

type SaveState = "idle" | "saving" | "success" | "error";

export function PuckEditor() {
  const t = useTranslations("builder");
  const locale = useLocale();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [projectName, setProjectName] = useState(`Landing ${locale.toUpperCase()}`);
  const [currentData, setCurrentData] = useState<Data | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [components, setComponents] = useState<StudioComponentDefinition[]>([]);
  const [blocks, setBlocks] = useState<StudioComponentBlock[]>([]);

  const [componentName, setComponentName] = useState("");
  const [componentDescription, setComponentDescription] = useState("");
  const [componentTemplate, setComponentTemplate] = useState<"card" | "hero" | "cta" | "text">(
    "card",
  );
  const [componentFieldsText, setComponentFieldsText] = useState(
    "title|Title|text\nbody|Body|textarea",
  );
  const [isSavingComponent, setIsSavingComponent] = useState(false);

  const [blockName, setBlockName] = useState("");
  const [blockDescription, setBlockDescription] = useState("");
  const [isSavingBlock, setIsSavingBlock] = useState(false);

  const projectId = useMemo(() => `starter-${locale}`, [locale]);
  const config = useMemo(() => buildPuckConfig(components, blocks), [components, blocks]);

  const reloadComponents = useCallback(async () => {
    const res = await fetch("/api/components", { cache: "no-store" });
    if (res.ok) {
      const payload = (await res.json()) as { components: StudioComponentDefinition[] };
      setComponents(payload.components);
    }
  }, []);

  const reloadBlocks = useCallback(async () => {
    const res = await fetch(`/api/component-blocks?locale=${locale}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const payload = (await res.json()) as { blocks: StudioComponentBlock[] };
      setBlocks(payload.blocks);
    }
  }, [locale]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      setIsLoading(true);

      try {
        const [projectRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`, { cache: "no-store" }),
          reloadComponents(),
          reloadBlocks(),
        ]);

        if (projectRes.ok) {
          const projectPayload = (await projectRes.json()) as {
            project: { name: string; content: unknown };
          };
          if (!mounted) return;
          setProjectName(projectPayload.project.name);
          setCurrentData(normalizePuckData(projectPayload.project.content));
        } else {
          if (!mounted) return;
          setCurrentData(initialDataWithFallback(null));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, [projectId, reloadBlocks, reloadComponents]);

  const onPublish = async (data: Data) => {
    setSaveState("saving");
    setCurrentData(data);
    setPublishedUrl(null);

    try {
      const saveRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: projectId,
          name: projectName,
          locale,
          content: data,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("failed to save project");
      }

      const publishRes = await fetch(`/api/projects/${projectId}/publish`, {
        method: "POST",
      });

      if (!publishRes.ok) {
        throw new Error("failed to publish project");
      }

      const publishPayload = (await publishRes.json()) as { publishedUrl?: string };
      if (publishPayload.publishedUrl) {
        setPublishedUrl(publishPayload.publishedUrl);
      }

      setSaveState("success");
    } catch {
      setSaveState("error");
    }
  };

  const onCreateComponent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!componentName.trim()) return;

    const fields = componentFieldsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [key, label, type] = line.split("|").map((segment) => segment.trim());
        return {
          key,
          label: label || key,
          type: type === "textarea" ? "textarea" : "text",
        };
      });

    if (fields.length === 0 || fields.some((field) => !field.key)) {
      return;
    }

    setIsSavingComponent(true);
    try {
      const defaults = Object.fromEntries(fields.map((field) => [field.key, ""]));
      const res = await fetch("/api/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: componentName,
          description: componentDescription,
          template: componentTemplate,
          fields,
          defaults,
        }),
      });

      if (!res.ok) {
        throw new Error("create component failed");
      }

      setComponentName("");
      setComponentDescription("");
      setComponentTemplate("card");
      setComponentFieldsText("title|Title|text\nbody|Body|textarea");
      await reloadComponents();
    } finally {
      setIsSavingComponent(false);
    }
  };

  const onCreateBlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!blockName.trim() || !currentData) return;

    const filteredContent = stripBlockComponentsForBlock(currentData.content as unknown[]);
    if (filteredContent.length === 0) {
      return;
    }

    setIsSavingBlock(true);
    try {
      const res = await fetch("/api/component-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: blockName,
          description: blockDescription,
          locale,
          content: filteredContent,
        }),
      });

      if (!res.ok) {
        throw new Error("create block failed");
      }

      setBlockName("");
      setBlockDescription("");
      await reloadBlocks();
    } finally {
      setIsSavingBlock(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-600">
        {saveState === "saving" && "Saving..."}
        {saveState === "success" && t("saveSuccess")}
        {saveState === "error" && t("saveFailed")}
        {saveState === "idle" && t("description")}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-black/10 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-900">{t("componentManagerTitle")}</h2>
          <p className="mt-1 text-xs text-zinc-600">{t("componentManagerDesc")}</p>
          <form className="mt-4 space-y-2" onSubmit={onCreateComponent}>
            <input
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              placeholder={t("componentName")}
              value={componentName}
              onChange={(event) => setComponentName(event.target.value)}
            />
            <input
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              placeholder={t("componentDescription")}
              value={componentDescription}
              onChange={(event) => setComponentDescription(event.target.value)}
            />
            <select
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              value={componentTemplate}
              onChange={(event) =>
                setComponentTemplate(
                  event.target.value as "card" | "hero" | "cta" | "text",
                )
              }
            >
              <option value="card">card</option>
              <option value="hero">hero</option>
              <option value="cta">cta</option>
              <option value="text">text</option>
            </select>
            <textarea
              className="h-24 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              placeholder={t("componentFieldsHint")}
              value={componentFieldsText}
              onChange={(event) => setComponentFieldsText(event.target.value)}
            />
            <button
              className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
              disabled={isSavingComponent}
              type="submit"
            >
              {isSavingComponent ? t("saving") : t("createComponent")}
            </button>
          </form>
          <ul className="mt-4 space-y-1 text-xs text-zinc-600">
            {components.map((item) => (
              <li key={item.id}>
                • {item.name} ({item.template})
              </li>
            ))}
            {components.length === 0 && <li>{t("emptyComponents")}</li>}
          </ul>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-900">{t("blockManagerTitle")}</h2>
          <p className="mt-1 text-xs text-zinc-600">{t("blockManagerDesc")}</p>
          <form className="mt-4 space-y-2" onSubmit={onCreateBlock}>
            <input
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              placeholder={t("blockName")}
              value={blockName}
              onChange={(event) => setBlockName(event.target.value)}
            />
            <input
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              placeholder={t("blockDescription")}
              value={blockDescription}
              onChange={(event) => setBlockDescription(event.target.value)}
            />
            <button
              className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
              disabled={isSavingBlock || !currentData}
              type="submit"
            >
              {isSavingBlock ? t("saving") : t("createBlock")}
            </button>
          </form>
          <ul className="mt-4 space-y-1 text-xs text-zinc-600">
            {blocks.map((item) => (
              <li key={item.id}>
                • {item.name}
              </li>
            ))}
            {blocks.length === 0 && <li>{t("emptyBlocks")}</li>}
          </ul>
        </section>
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-4">
        <label className="text-xs font-medium text-zinc-700">{t("projectName")}</label>
        <input
          className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
        />
        {publishedUrl ? (
          <p className="mt-2 text-xs text-emerald-700">
            {t("publishedLinkLabel")}{" "}
            <a className="underline" href={publishedUrl} target="_blank" rel="noreferrer">
              {publishedUrl}
            </a>
          </p>
        ) : null}
      </div>

      {!isLoading && currentData ? (
        <Puck
          config={config}
          data={initialDataWithFallback(currentData)}
          onChange={setCurrentData}
          onPublish={onPublish}
        />
      ) : (
        <div className="rounded-xl border border-black/10 bg-white px-4 py-8 text-sm text-zinc-500">
          {t("loading")}
        </div>
      )}
    </div>
  );
}
