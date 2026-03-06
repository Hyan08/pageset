# Webflow-like Studio (Vercel Style) - 需求调研与方案

## 1. 目标拆解

用户目标：

1. 使用 Next.js 搭建一个尽可能接近 Webflow 的系统（以页面构建器为核心）；
2. 视觉风格偏 Vercel（简洁、黑白灰、低饱和渐变、卡片化）；
3. 后端采用 Cloudflare 全家桶；
4. 需要多语言、组件化，并考虑/接入 Puck；
5. 全流程可追踪（每一步有完成记录）。

## 2. 范围界定（MVP）

由于 Webflow 是大型产品，本次先完成可运行 MVP：

- 营销站点首页（Webflow 功能表达 + Vercel 风格 UI）；
- 多语言（中文/英文）路由与文案；
- 组件化页面结构（Header/Hero/Feature/Pricing/CTA）；
- Puck 可视化编辑入口（Builder 页面）；
- Cloudflare 后端接口（D1 + KV + R2 + Queue + Durable Object 接口位）；
- Cloudflare 部署脚手架（OpenNext + Wrangler 配置）；
- 全过程日志文档。

## 3. 技术选型

- **前端框架**：Next.js (App Router, TypeScript, Tailwind CSS v4)
- **多语言**：next-intl
- **可视化编辑器**：@puckeditor/core
- **数据校验**：zod
- **Cloudflare 适配**：
  - @opennextjs/cloudflare
  - wrangler
  - @cloudflare/workers-types

## 4. Cloudflare 全家桶映射

- **Workers**：承载 Next.js 服务（OpenNext for Cloudflare）
- **D1**：项目/页面元数据（示例表 `projects`）
- **KV**：热点项目摘要缓存
- **R2**：静态资源对象存储
- **Queues**：发布事件异步处理（如发布后通知/CDN刷新）
- **Durable Objects**：协同编辑会话（本次保留接口与绑定位）

## 5. 代码结构规划

```txt
src/
  app/
    [locale]/
      page.tsx
      builder/page.tsx
      layout.tsx
    api/
      projects/route.ts
      projects/[id]/publish/route.ts
      assets/upload/route.ts
    page.tsx
  components/
    layout/
    sections/
    builder/
  i18n/
    routing.ts
    navigation.ts
    request.ts
  lib/
    cloudflare.ts
    studio-store.ts
  messages/
    en.json
    zh.json
docs/
  IMPLEMENTATION_LOG.md
wrangler.toml
open-next.config.ts
```

## 6. 风险与约束

- 本地 `next dev` 下无真实 Cloudflare 绑定，需内存存储兜底；
- Durable Object 真正协同逻辑需独立 Worker 类与生产绑定，此次先实现可扩展接口；
- Webflow 全量能力（复杂动画/Team权限/CMS模板市场）不在 MVP 一次性覆盖范围。

## 7. 验收标准（本次）

1. 访问 `/zh` 与 `/en` 均可正常显示；
2. 首页为组件化结构且视觉趋近 Vercel 风格；
3. `/[locale]/builder` 可打开 Puck 编辑器并触发保存；
4. API 能在无 Cloudflare 绑定时正常返回（fallback），在有绑定时优先用 Cloudflare；
5. 文档中有完整实施日志。
