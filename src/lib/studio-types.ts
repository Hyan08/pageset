export type StudioProjectStatus = "draft" | "published";

export type StudioProject = {
  id: string;
  name: string;
  locale: string;
  status: StudioProjectStatus;
  content: unknown;
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
