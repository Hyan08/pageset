import type {
  StudioBreakpoint,
  StudioDesignTokenValues,
  StudioDesignTokens,
} from "@/lib/studio-types";

const defaultTokenValues: StudioDesignTokenValues = {
  bgColor: "#ffffff",
  textColor: "#0a0a0a",
  brandColor: "#111111",
  radius: "16px",
  space: "20px",
  fontSize: "16px",
};

export const DEFAULT_DESIGN_TOKENS: StudioDesignTokens = {
  desktop: { ...defaultTokenValues },
  tablet: { ...defaultTokenValues, fontSize: "15px", radius: "14px" },
  mobile: { ...defaultTokenValues, fontSize: "14px", radius: "12px", space: "16px" },
};

function safeString(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 32 ? trimmed : fallback;
}

function mergeTokenValues(value: unknown, fallback: StudioDesignTokenValues) {
  const typed = (value ?? {}) as Partial<StudioDesignTokenValues>;
  return {
    bgColor: safeString(typed.bgColor, fallback.bgColor),
    textColor: safeString(typed.textColor, fallback.textColor),
    brandColor: safeString(typed.brandColor, fallback.brandColor),
    radius: safeString(typed.radius, fallback.radius),
    space: safeString(typed.space, fallback.space),
    fontSize: safeString(typed.fontSize, fallback.fontSize),
  };
}

export function normalizeDesignTokens(value: unknown): StudioDesignTokens {
  const typed = (value ?? {}) as Partial<StudioDesignTokens>;
  return {
    desktop: mergeTokenValues(typed.desktop, DEFAULT_DESIGN_TOKENS.desktop),
    tablet: mergeTokenValues(typed.tablet, DEFAULT_DESIGN_TOKENS.tablet),
    mobile: mergeTokenValues(typed.mobile, DEFAULT_DESIGN_TOKENS.mobile),
  };
}

export function designTokensToCssVars(
  tokens: StudioDesignTokens,
  breakpoint: StudioBreakpoint,
) {
  const selected = tokens[breakpoint];
  return {
    "--ff-bg-color": selected.bgColor,
    "--ff-text-color": selected.textColor,
    "--ff-brand-color": selected.brandColor,
    "--ff-radius": selected.radius,
    "--ff-space": selected.space,
    "--ff-font-size": selected.fontSize,
  } as Record<string, string>;
}

export const PREVIEW_MAX_WIDTH: Record<StudioBreakpoint, string> = {
  desktop: "100%",
  tablet: "860px",
  mobile: "420px",
};
