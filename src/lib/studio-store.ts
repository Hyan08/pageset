import { z } from "zod";
import { getCloudflareEnv } from "@/lib/cloudflare";
import type {
  StudioComponentBlock,
  StudioComponentDefinition,
  StudioProject,
} from "@/lib/studio-types";

const globalStore = globalThis as unknown as {
  __studioProjects?: Map<string, StudioProject>;
  __studioComponents?: Map<string, StudioComponentDefinition>;
  __studioBlocks?: Map<string, StudioComponentBlock>;
};

const memoryProjects = globalStore.__studioProjects ?? new Map<string, StudioProject>();
const memoryComponents =
  globalStore.__studioComponents ?? new Map<string, StudioComponentDefinition>();
const memoryBlocks = globalStore.__studioBlocks ?? new Map<string, StudioComponentBlock>();

if (!globalStore.__studioProjects) {
  globalStore.__studioProjects = memoryProjects;
}
if (!globalStore.__studioComponents) {
  globalStore.__studioComponents = memoryComponents;
}
if (!globalStore.__studioBlocks) {
  globalStore.__studioBlocks = memoryBlocks;
}

function createStableId(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export const projectInputSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(1),
  locale: z.string().min(2),
  content: z.unknown(),
});

export const componentFieldSchema = z.object({
  key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  label: z.string().min(1),
  type: z.enum(["text", "textarea"]),
});

export const componentInputSchema = z.object({
  id: z.string().min(3).optional(),
  name: z.string().min(1),
  description: z.string().default(""),
  template: z.enum(["card", "hero", "cta", "text"]),
  fields: z.array(componentFieldSchema).min(1),
  defaults: z.record(z.string(), z.string()).default({}),
});

export const componentBlockInputSchema = z.object({
  id: z.string().min(3).optional(),
  name: z.string().min(1),
  description: z.string().default(""),
  locale: z.string().min(2),
  content: z.array(z.unknown()).min(1),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ComponentInput = z.infer<typeof componentInputSchema>;
export type ComponentBlockInput = z.infer<typeof componentBlockInputSchema>;

function deserializeProjectRow(row: Record<string, unknown>): StudioProject {
  return {
    id: String(row.id),
    name: String(row.name),
    locale: String(row.locale),
    status: row.status === "published" ? "published" : "draft",
    content:
      typeof row.content_json === "string"
        ? JSON.parse(row.content_json)
        : row.content_json ?? {},
    updatedAt: String(row.updated_at),
  };
}

function deserializeComponentRow(row: Record<string, unknown>): StudioComponentDefinition {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    template: String(row.template) as StudioComponentDefinition["template"],
    fields:
      typeof row.fields_json === "string"
        ? JSON.parse(row.fields_json)
        : (row.fields_json as StudioComponentDefinition["fields"]),
    defaults:
      typeof row.defaults_json === "string"
        ? JSON.parse(row.defaults_json)
        : (row.defaults_json as StudioComponentDefinition["defaults"]),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function deserializeBlockRow(row: Record<string, unknown>): StudioComponentBlock {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    locale: String(row.locale),
    content:
      typeof row.content_json === "string"
        ? JSON.parse(row.content_json)
        : (row.content_json as unknown[]),
    updatedAt: String(row.updated_at),
  };
}

export async function listProjects(): Promise<StudioProject[]> {
  const env = await getCloudflareEnv();

  if (env?.STUDIO_DB) {
    try {
      const { results } = await env.STUDIO_DB.prepare(
        "SELECT id, name, locale, status, content_json, updated_at FROM projects ORDER BY updated_at DESC LIMIT 100",
      ).all<Record<string, unknown>>();
      return results.map(deserializeProjectRow);
    } catch {
      // fall through
    }
  }

  return Array.from(memoryProjects.values()).sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  );
}

export async function getProjectById(projectId: string): Promise<StudioProject | null> {
  const env = await getCloudflareEnv();

  if (env?.STUDIO_DB) {
    try {
      const row = await env.STUDIO_DB.prepare(
        "SELECT id, name, locale, status, content_json, updated_at FROM projects WHERE id = ?1 LIMIT 1",
      )
        .bind(projectId)
        .first<Record<string, unknown>>();

      if (row) {
        return deserializeProjectRow(row);
      }
    } catch {
      // fall through
    }
  }

  return memoryProjects.get(projectId) ?? null;
}

export async function saveProject(input: ProjectInput): Promise<StudioProject> {
  const env = await getCloudflareEnv();
  const now = new Date().toISOString();
  const project: StudioProject = {
    id: input.id,
    name: input.name,
    locale: input.locale,
    status: "draft",
    content: input.content,
    updatedAt: now,
  };

  if (env?.STUDIO_DB) {
    try {
      await env.STUDIO_DB.prepare(
        `INSERT INTO projects (id, name, locale, status, content_json, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           locale = excluded.locale,
           status = excluded.status,
           content_json = excluded.content_json,
           updated_at = excluded.updated_at`,
      )
        .bind(
          project.id,
          project.name,
          project.locale,
          project.status,
          JSON.stringify(project.content),
          project.updatedAt,
        )
        .run();
    } catch {
      memoryProjects.set(project.id, project);
    }
  } else {
    memoryProjects.set(project.id, project);
  }

  if (env?.STUDIO_KV) {
    void env.STUDIO_KV.put(
      `project:${project.id}:meta`,
      JSON.stringify({
        id: project.id,
        locale: project.locale,
        status: project.status,
        updatedAt: project.updatedAt,
      }),
      { expirationTtl: 60 * 30 },
    );
  }

  return project;
}

export async function publishProject(projectId: string): Promise<{
  project: StudioProject;
  publishedUrl: string;
} | null> {
  const env = await getCloudflareEnv();
  const now = new Date().toISOString();
  let project: StudioProject | null = memoryProjects.get(projectId) ?? null;

  if (env?.STUDIO_DB) {
    try {
      await env.STUDIO_DB.prepare(
        "UPDATE projects SET status = 'published', updated_at = ?2 WHERE id = ?1",
      )
        .bind(projectId, now)
        .run();

      const selected = await env.STUDIO_DB.prepare(
        "SELECT id, name, locale, status, content_json, updated_at FROM projects WHERE id = ?1 LIMIT 1",
      )
        .bind(projectId)
        .first<Record<string, unknown>>();

      if (selected) {
        project = deserializeProjectRow(selected);
      }
    } catch {
      // fallback to memory update
    }
  }

  if (!project) {
    return null;
  }

  const published: StudioProject = { ...project, status: "published", updatedAt: now };
  memoryProjects.set(projectId, published);

  if (env?.STUDIO_KV) {
    void env.STUDIO_KV.put(
      `project:${projectId}:meta`,
      JSON.stringify({
        id: projectId,
        locale: published.locale,
        status: "published",
        updatedAt: now,
      }),
      { expirationTtl: 60 * 30 },
    );
  }

  if (env?.STUDIO_PUBLISH_QUEUE) {
    void env.STUDIO_PUBLISH_QUEUE.send({
      type: "project.published",
      projectId,
      locale: published.locale,
      timestamp: now,
    });
  }

  if (env?.STUDIO_COLLAB_DO) {
    try {
      const room = env.STUDIO_COLLAB_DO.idFromName(projectId);
      const stub = env.STUDIO_COLLAB_DO.get(room);
      void stub.fetch("https://collab.internal/publish", {
        method: "POST",
        body: JSON.stringify({ projectId, timestamp: now }),
      });
    } catch {
      // ignore DO failures
    }
  }

  return {
    project: published,
    publishedUrl: `/${published.locale}/published/${published.id}`,
  };
}

export async function listComponents(): Promise<StudioComponentDefinition[]> {
  const env = await getCloudflareEnv();

  if (env?.STUDIO_DB) {
    try {
      const { results } = await env.STUDIO_DB.prepare(
        "SELECT id, name, description, template, fields_json, defaults_json, created_at, updated_at FROM components ORDER BY updated_at DESC LIMIT 200",
      ).all<Record<string, unknown>>();
      return results.map(deserializeComponentRow);
    } catch {
      // fall through
    }
  }

  return Array.from(memoryComponents.values()).sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  );
}

export async function saveComponent(
  input: ComponentInput,
): Promise<StudioComponentDefinition> {
  const env = await getCloudflareEnv();
  const now = new Date().toISOString();
  const id = createStableId(input.id ?? input.name) || `component-${Date.now()}`;
  const existing = memoryComponents.get(id);

  const component: StudioComponentDefinition = {
    id,
    name: input.name,
    description: input.description,
    template: input.template,
    fields: input.fields,
    defaults: input.defaults,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (env?.STUDIO_DB) {
    try {
      await env.STUDIO_DB.prepare(
        `INSERT INTO components
          (id, name, description, template, fields_json, defaults_json, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           description = excluded.description,
           template = excluded.template,
           fields_json = excluded.fields_json,
           defaults_json = excluded.defaults_json,
           updated_at = excluded.updated_at`,
      )
        .bind(
          component.id,
          component.name,
          component.description,
          component.template,
          JSON.stringify(component.fields),
          JSON.stringify(component.defaults),
          component.createdAt,
          component.updatedAt,
        )
        .run();
    } catch {
      memoryComponents.set(component.id, component);
    }
  } else {
    memoryComponents.set(component.id, component);
  }

  return component;
}

export async function listComponentBlocks(
  locale?: string,
): Promise<StudioComponentBlock[]> {
  const env = await getCloudflareEnv();

  if (env?.STUDIO_DB) {
    try {
      const statement = locale
        ? env.STUDIO_DB.prepare(
            "SELECT id, name, description, locale, content_json, updated_at FROM component_blocks WHERE locale = ?1 ORDER BY updated_at DESC LIMIT 200",
          ).bind(locale)
        : env.STUDIO_DB.prepare(
            "SELECT id, name, description, locale, content_json, updated_at FROM component_blocks ORDER BY updated_at DESC LIMIT 200",
          );
      const { results } = await statement.all<Record<string, unknown>>();
      return results.map(deserializeBlockRow);
    } catch {
      // fall through
    }
  }

  const all = Array.from(memoryBlocks.values());
  return all
    .filter((item) => (locale ? item.locale === locale : true))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function saveComponentBlock(
  input: ComponentBlockInput,
): Promise<StudioComponentBlock> {
  const env = await getCloudflareEnv();
  const now = new Date().toISOString();
  const id = createStableId(input.id ?? input.name) || `block-${Date.now()}`;

  const block: StudioComponentBlock = {
    id,
    name: input.name,
    description: input.description,
    locale: input.locale,
    content: input.content,
    updatedAt: now,
  };

  if (env?.STUDIO_DB) {
    try {
      await env.STUDIO_DB.prepare(
        `INSERT INTO component_blocks (id, name, description, locale, content_json, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           description = excluded.description,
           locale = excluded.locale,
           content_json = excluded.content_json,
           updated_at = excluded.updated_at`,
      )
        .bind(
          block.id,
          block.name,
          block.description,
          block.locale,
          JSON.stringify(block.content),
          block.updatedAt,
        )
        .run();
    } catch {
      memoryBlocks.set(block.id, block);
    }
  } else {
    memoryBlocks.set(block.id, block);
  }

  return block;
}

export async function uploadAssetToR2(
  key: string,
  bytes: ArrayBuffer,
  contentType: string,
) {
  const env = await getCloudflareEnv();

  if (env?.STUDIO_ASSETS) {
    await env.STUDIO_ASSETS.put(key, bytes, {
      httpMetadata: { contentType },
    });
    return { key, storage: "r2" as const };
  }

  return { key, storage: "memory" as const };
}
