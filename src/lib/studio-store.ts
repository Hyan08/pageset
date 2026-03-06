import { z } from "zod";
import { getCloudflareEnv } from "@/lib/cloudflare";

const globalStore = globalThis as unknown as {
  __studioProjects?: Map<string, StudioProject>;
};

const memoryProjects = globalStore.__studioProjects ?? new Map<string, StudioProject>();
if (!globalStore.__studioProjects) {
  globalStore.__studioProjects = memoryProjects;
}

export const projectInputSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(1),
  locale: z.string().min(2),
  content: z.unknown(),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export type StudioProject = {
  id: string;
  name: string;
  locale: string;
  status: "draft" | "published";
  content: unknown;
  updatedAt: string;
};

function deserializeProjectRow(row: Record<string, unknown>): StudioProject {
  return {
    id: String(row.id),
    name: String(row.name),
    locale: String(row.locale),
    status: (row.status === "published" ? "published" : "draft") as
      | "draft"
      | "published",
    content:
      typeof row.content_json === "string"
        ? JSON.parse(row.content_json)
        : row.content_json ?? {},
    updatedAt: String(row.updated_at),
  };
}

export async function listProjects(): Promise<StudioProject[]> {
  const env = await getCloudflareEnv();

  if (env?.STUDIO_DB) {
    try {
      const { results } = await env.STUDIO_DB.prepare(
        "SELECT id, name, locale, status, content_json, updated_at FROM projects ORDER BY updated_at DESC LIMIT 50",
      ).all<Record<string, unknown>>();

      return results.map(deserializeProjectRow);
    } catch {
      // fall through to memory store
    }
  }

  return Array.from(memoryProjects.values()).sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  );
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

export async function publishProject(projectId: string): Promise<StudioProject | null> {
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

  const published: StudioProject = {
    ...project,
    status: "published",
    updatedAt: now,
  };

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
      // ignore DO failures to avoid blocking publishing
    }
  }

  return published;
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
