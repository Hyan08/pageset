import { Render, type Config, type Data } from "@puckeditor/core";
import { basePuckConfig, baseInitialPuckData } from "@/components/builder/puck-config";
import type {
  StudioComponentBlock,
  StudioComponentDefinition,
} from "@/lib/studio-types";

type PuckContentItem = Data["content"][number];

function normalizePuckContent(content: unknown): Data["content"] {
  if (!Array.isArray(content)) {
    return [];
  }

  return content.filter((item): item is PuckContentItem => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const typed = item as { type?: unknown; props?: unknown };
    return typeof typed.type === "string" && typeof typed.props === "object";
  });
}

export function normalizePuckData(data: unknown): Data {
  const typed = (data ?? {}) as Partial<Data>;
  return {
    content: normalizePuckContent(typed.content),
    root: typed.root ?? {},
    zones: typed.zones ?? {},
  };
}

function renderByTemplate(
  template: StudioComponentDefinition["template"],
  def: StudioComponentDefinition,
  props: Record<string, string | undefined>,
) {
  const fields = def.fields.map((field) => ({
    label: field.label,
    value: props[field.key] ?? "",
  }));

  if (template === "hero") {
    const title = fields[0]?.value || def.name;
    const description = fields[1]?.value || "";
    const cta = fields[2]?.value || "Learn more";
    return (
      <section className="rounded-2xl border border-black/10 bg-white p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Custom Hero
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-zinc-900">{title}</h2>
        <p className="mt-3 text-zinc-600">{description}</p>
        <button
          className="mt-5 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
          type="button"
        >
          {cta}
        </button>
      </section>
    );
  }

  if (template === "cta") {
    const title = fields[0]?.value || def.name;
    const buttonText = fields[1]?.value || "Action";
    return (
      <section className="rounded-2xl bg-zinc-950 p-8 text-white">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <button
          className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
          type="button"
        >
          {buttonText}
        </button>
      </section>
    );
  }

  if (template === "text") {
    return (
      <article className="rounded-2xl border border-black/10 bg-white p-5">
        {fields.map((field) => (
          <p key={field.label} className="mb-2 text-sm text-zinc-700 last:mb-0">
            <span className="font-medium text-zinc-900">{field.label}: </span>
            {field.value}
          </p>
        ))}
      </article>
    );
  }

  // card template
  const title = fields[0]?.value || def.name;
  const body = fields[1]?.value || def.description;
  return (
    <article className="rounded-2xl border border-black/10 bg-white p-5">
      <h3 className="text-lg font-medium text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600">{body}</p>
      {fields.slice(2).map((field) => (
        <p key={field.label} className="mt-2 text-xs text-zinc-500">
          {field.label}: {field.value}
        </p>
      ))}
    </article>
  );
}

function componentType(definitionId: string) {
  return `Uploaded_${definitionId.replace(/[^a-zA-Z0-9_]/g, "_")}`;
}

function blockType(blockId: string) {
  return `Block_${blockId.replace(/[^a-zA-Z0-9_]/g, "_")}`;
}

export function buildPuckConfig(
  componentDefinitions: StudioComponentDefinition[],
  componentBlocks: StudioComponentBlock[],
): Config {
  const uploadedComponents: Config["components"] = {};

  for (const definition of componentDefinitions) {
    const fields = Object.fromEntries(
      definition.fields.map((field) => [field.key, { label: field.label, type: field.type }]),
    );

    uploadedComponents[componentType(definition.id)] = {
      label: `Uploaded · ${definition.name}`,
      fields,
      render: (props: Record<string, string>) =>
        renderByTemplate(definition.template, definition, props),
    };
  }

  const configWithoutBlocks: Config = {
    components: {
      ...basePuckConfig.components,
      ...uploadedComponents,
    },
  };

  const blockComponents: Config["components"] = {};
  for (const block of componentBlocks) {
    blockComponents[blockType(block.id)] = {
      label: `Block · ${block.name}`,
      fields: {},
      render: () => (
        <section className="rounded-2xl border border-dashed border-black/20 bg-zinc-50 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
            {block.name}
          </p>
          <Render
            config={configWithoutBlocks}
            data={{
              content: normalizePuckContent(block.content),
              root: {},
              zones: {},
            }}
          />
        </section>
      ),
    };
  }

  return {
    components: {
      ...configWithoutBlocks.components,
      ...blockComponents,
    },
  };
}

export function initialDataWithFallback(data: unknown): Data {
  const normalized = normalizePuckData(data);
  return normalized.content.length > 0 ? normalized : baseInitialPuckData;
}

export function stripBlockComponentsForBlock(content: unknown[]): unknown[] {
  return content.filter((item) => {
    if (!item || typeof item !== "object") {
      return true;
    }

    const typed = item as { type?: string };
    return !String(typed.type ?? "").startsWith("Block_");
  });
}
