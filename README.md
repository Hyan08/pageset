# Flowforge Studio

Webflow-like 可视化建站系统（Vercel 风格）+ Cloudflare 后端（D1/KV/R2/Queue 扩展位）。

## 已实现能力

- Next.js App Router + TypeScript + Tailwind
- 多语言（`/zh`、`/en`）基于 `next-intl`
- 组件化营销页（Vercel 风格）
- Puck 可视化编辑器（`/[locale]/builder`）
- 组件管理：上传自定义组件并进入编辑器物料库
- 组件块：将多个组件保存为可复用 Block
- 发布页面：`/[locale]/published/[projectId]`
- API + Cloudflare 绑定抽象（含本地 fallback）
- OpenNext Cloudflare + Wrangler 配置

## 本地开发

```bash
npm install
npm run dev
```

默认首页会跳转到 `/zh`。

## 质量检查

```bash
npm run lint
npm run build
```

## Cloudflare 相关命令

```bash
# OpenNext 构建
npm run cf:build

# 本地预览（Cloudflare Worker 形态）
npm run cf:preview

# 发布（需提前配置 wrangler 凭据与资源）
npm run cf:deploy

# 本地应用 D1 migration
npm run db:migrate:local
```

## 资源绑定配置

请在 `wrangler.toml` 中替换以下占位值：

- `REPLACE_WITH_D1_DATABASE_ID`
- `REPLACE_WITH_KV_NAMESPACE_ID`

并按需创建：

- R2 Bucket: `webflow-studio-assets`
- Queue: `webflow-studio-publish`

## 过程记录

- 需求与架构：`docs/RESEARCH_AND_PLAN.md`
- 分步实施日志：`docs/IMPLEMENTATION_LOG.md`
