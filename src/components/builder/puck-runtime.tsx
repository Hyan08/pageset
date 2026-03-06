import { Render, type Config, type Data } from "@puckeditor/core";
import { basePuckConfig, baseInitialPuckData } from "@/components/builder/puck-config";
import type {
  StudioComponentBlock,
  StudioComponentDefinition,
} from "@/lib/studio-types";

type PuckContentItem = Data["content"][number];
const tokenCardStyle = {
  borderRadius: "var(--ff-radius)",
  backgroundColor: "var(--ff-bg-color)",
  color: "var(--ff-text-color)",
  padding: "var(--ff-space)",
  fontSize: "var(--ff-font-size)",
} as const;

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
      <section className="border border-black/10" style={tokenCardStyle}>
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#666" }}>
          Custom Hero
        </p>
        <h2 className="mt-3 text-3xl font-semibold">{title}</h2>
        <p className="mt-3 opacity-80">{description}</p>
        <button
          className="mt-5 rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{
            backgroundColor: "var(--ff-brand-color)",
          }}
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
      <section
        className="border border-black/10 text-white"
        style={{
          ...tokenCardStyle,
          backgroundColor: "var(--ff-brand-color)",
          color: "#fff",
        }}
      >
        <h3 className="text-2xl font-semibold">{title}</h3>
        <button
          className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold"
          style={{ color: "var(--ff-brand-color)" }}
          type="button"
        >
          {buttonText}
        </button>
      </section>
    );
  }

  if (template === "text") {
    return (
      <article className="border border-black/10" style={tokenCardStyle}>
        {fields.map((field) => (
          <p key={field.label} className="mb-2 text-sm last:mb-0">
            <span className="font-medium">{field.label}: </span>
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
    <article className="border border-black/10" style={tokenCardStyle}>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm opacity-80">{body}</p>
      {fields.slice(2).map((field) => (
        <p key={field.label} className="mt-2 text-xs opacity-70">
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
        <section className="border border-dashed border-black/20" style={tokenCardStyle}>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide opacity-70">
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
