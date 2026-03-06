export type StudioProjectStatus = "draft" | "published";
export type StudioBreakpoint = "desktop" | "tablet" | "mobile";

export type StudioDesignTokenValues = {
  bgColor: string;
  textColor: string;
  brandColor: string;
  radius: string;
  space: string;
  fontSize: string;
};

export type StudioDesignTokens = Record<StudioBreakpoint, StudioDesignTokenValues>;

export type StudioProject = {
  id: string;
  name: string;
  locale: string;
  status: StudioProjectStatus;
  content: unknown;
  designTokens: StudioDesignTokens;
  updatedAt: string;
};

export type StudioFieldType = "text" | "textarea";

export type StudioComponentTemplate = "card" | "hero" | "cta" | "text";

export type StudioComponentField = {
  key: string;
  label: string;
  type: StudioFieldType;
};

export type StudioComponentDefinition = {
  id: string;
  name: string;
  description: string;
  template: StudioComponentTemplate;
  fields: StudioComponentField[];
  defaults: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type StudioComponentBlock = {
  id: string;
  name: string;
  description: string;
  locale: string;
  content: unknown[];
  updatedAt: string;
};
