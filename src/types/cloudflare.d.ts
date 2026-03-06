export {};

declare global {
  interface CloudflareEnv {
    STUDIO_DB?: D1Database;
    STUDIO_KV?: KVNamespace;
    STUDIO_ASSETS?: R2Bucket;
    STUDIO_PUBLISH_QUEUE?: Queue;
    STUDIO_COLLAB_DO?: DurableObjectNamespace;
  }
}
