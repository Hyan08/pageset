import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getCloudflareEnv() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env;
  } catch {
    // next dev or non-cloudflare runtime fallback
    return null;
  }
}
