"use client";

import { useMemo, useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { useLocale, useTranslations } from "next-intl";
import { initialPuckData, puckConfig } from "@/components/builder/puck-config";

type SaveState = "idle" | "saving" | "success" | "error";

export function PuckEditor() {
  const t = useTranslations("builder");
  const locale = useLocale();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const projectId = useMemo(() => `starter-${locale}`, [locale]);

  const onPublish = async (data: Data) => {
    setSaveState("saving");

    try {
      const saveRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: projectId,
          name: `Landing ${locale.toUpperCase()}`,
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

      setSaveState("success");
    } catch {
      setSaveState("error");
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

      <Puck config={puckConfig} data={initialPuckData} onPublish={onPublish} />
    </div>
  );
}
