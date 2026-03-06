import type { Config, Data } from "@puckeditor/core";

export const basePuckConfig: Config = {
  components: {
    HeroBlock: {
      label: "Hero",
      fields: {
        eyebrow: { type: "text" },
        title: { type: "text" },
        description: { type: "textarea" },
        buttonText: { type: "text" },
      },
      render: ({ eyebrow, title, description, buttonText }) => (
        <section className="rounded-2xl border border-black/10 bg-white p-8">
          <p className="text-xs font-medium text-zinc-500">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{title}</h2>
          <p className="mt-3 max-w-2xl text-zinc-600">{description}</p>
          <button
            className="mt-5 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
            type="button"
          >
            {buttonText}
          </button>
        </section>
      ),
    },
    FeatureCard: {
      label: "Feature Card",
      fields: {
        title: { type: "text" },
        body: { type: "textarea" },
      },
      render: ({ title, body }) => (
        <article className="rounded-2xl border border-black/10 bg-white p-5">
          <h3 className="text-lg font-medium text-zinc-900">{title}</h3>
          <p className="mt-2 text-sm text-zinc-600">{body}</p>
        </article>
      ),
    },
    CtaBlock: {
      label: "CTA",
      fields: {
        title: { type: "text" },
        buttonText: { type: "text" },
      },
      render: ({ title, buttonText }) => (
        <section className="rounded-2xl bg-zinc-950 p-8 text-white">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <button
            className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
            type="button"
          >
            {buttonText}
          </button>
        </section>
      ),
    },
  },
};

export const baseInitialPuckData: Data = {
  content: [
    {
      type: "HeroBlock",
      props: {
        eyebrow: "Visual Editing",
        title: "Build and ship pages visually",
        description: "Compose pages with reusable blocks and publish in seconds.",
        buttonText: "Start",
      },
    },
    {
      type: "FeatureCard",
      props: {
        title: "Reusable components",
        body: "Define once, reuse everywhere.",
      },
    },
    {
      type: "CtaBlock",
      props: {
        title: "Publish to Cloudflare",
        buttonText: "Publish",
      },
    },
  ],
  root: {},
  zones: {},
};
