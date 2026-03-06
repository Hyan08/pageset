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

## 8. Webflow 需求全景拆解（面向“接近 1:1”）

> 说明：Webflow 是多产品矩阵平台，单次迭代无法完全达到 1:1。这里给出“功能域-能力点-当前状态-下一阶段”矩阵，用于持续自动推进。

### A. 设计器 / Visual Builder

- 页面树（Navigator）、层级拖拽、样式面板（Typography/Layout/Spacing/Effects）
- Breakpoint 级联样式（Desktop/Tablet/Mobile）
- Class/Combo Class 体系与样式复用
- 交互与动画（scroll, hover, timeline）
- 资产库（图片、视频、图标、Lottie）

当前状态：

- 已有 Puck 编辑器、基础组件体系、组件上传、组件块复用、发布流程；
- 尚未实现完整样式系统、断点编辑器、动画时间线。

### B. CMS

- Collection 建模（字段类型、引用、多语言）
- 条目编辑/草稿/发布
- 模板页与动态路由绑定
- CMS API 与 webhook

当前状态：

- 已有项目内容保存与发布；
- 尚未实现 Collection 建模和动态模板页引擎。

### C. Hosting / Publishing

- 预览环境（staging domain）
- 增量发布、回滚、发布历史
- CDN 缓存刷新策略
- SEO（sitemap、meta、结构化数据）

当前状态：

- 已有发布 API、发布页面 URL、Queue 事件；
- 尚未实现版本回滚、发布历史 UI、完整 SEO 面板。

### D. Team / Collaboration

- 成员与角色权限（Owner/Editor/Designer）
- 协同编辑（presence、冲突处理）
- 评论/批注流

当前状态：

- 已预留 Durable Objects 接口；
- 尚未实现完整实时协同和权限模型。

### E. Commerce / Membership（后续）

- 商品、订单、支付、税费
- 会员内容、登录与权限

当前状态：

- 未进入本阶段。

## 9. 自动推进路线（分阶段）

### Phase 1（已完成）

- 多语言 + 组件化首页 + Puck + Cloudflare 基础后端。

### Phase 2（本次迭代）

- 组件管理（上传后可在编辑器中使用）；
- 组件块（多个组件组合成可复用块）；
- 发布页面（可访问的已发布 URL）。

### Phase 3（下一轮）

- 页面树（Navigator）+ 图层重排；
- 断点样式编辑（Desktop/Tablet/Mobile）；
- 站点级样式 Token（字体、颜色、间距）。

### Phase 4（后续）

- CMS Collection 与动态模板页；
- 发布历史、回滚、审核流；
- 团队权限与协同编辑（DO + presence）。
