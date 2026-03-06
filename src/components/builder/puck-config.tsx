import type { Config, Data } from "@puckeditor/core";

const baseCardStyle = {
  borderRadius: "var(--ff-radius)",
  backgroundColor: "var(--ff-bg-color)",
  color: "var(--ff-text-color)",
  padding: "var(--ff-space)",
  fontSize: "var(--ff-font-size)",
} as const;

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
        <section className="border border-black/10" style={baseCardStyle}>
          <p className="text-xs font-medium opacity-70">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-3 max-w-2xl opacity-80">{description}</p>
          <button
            className="mt-5 rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--ff-brand-color)" }}
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
        <article className="border border-black/10" style={baseCardStyle}>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="mt-2 text-sm opacity-80">{body}</p>
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
        <section
          className="border border-black/10 text-white"
          style={{
            ...baseCardStyle,
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
