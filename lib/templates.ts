import type { ComponentType } from "react";
import type { ResumeData } from "@/types";

import CleanTemplate, {
  CLEAN_THEMES,
} from "@/components/resume-templates/CleanTemplate";
import ModernTemplate from "@/components/resume-templates/ModernTemplate";
import CreativeTemplate, {
  CREATIVE_THEMES,
} from "@/components/resume-templates/CreativeTemplate";
import ElegantTemplate from "@/components/resume-templates/ElegantTemplate";
import ElegantSingleTemplate from "@/components/resume-templates/ElegantSingleTemplate";
import ElegantDarkTemplate, {
  ELEGANT_DARK_THEMES,
} from "@/components/resume-templates/ElegantDarkTemplate";
import ElegantBannerTemplate from "@/components/resume-templates/ElegantBannerTemplate";
import BoldPhotoTemplate, {
  BOLD_PHOTO_THEMES,
} from "@/components/resume-templates/BoldPhotoTemplate";
import ProSidebarTemplate, {
  PRO_SIDEBAR_THEMES,
} from "@/components/resume-templates/ProSidebarTemplate";
import SoftPortraitTemplate, {
  SOFT_PORTRAIT_THEMES,
} from "@/components/resume-templates/SoftPortraitTemplate";
import GeometricTemplate, {
  GEOMETRIC_THEMES,
} from "@/components/resume-templates/GeometricTemplate";
import BoldHeaderTemplate, {
  BOLD_HEADER_THEMES,
} from "@/components/resume-templates/BoldHeaderTemplate";
import EditorialTemplate, {
  EDITORIAL_THEMES,
} from "@/components/resume-templates/EditorialTemplate";
import ColumnarTemplate, {
  COLUMNAR_THEMES,
} from "@/components/resume-templates/ColumnarTemplate";

export type TemplateComponent = ComponentType<{ data: ResumeData }>;

export interface ThemeOption {
  key: string;
  label: string;
  sidebarBg: string;
  accent: string;
}

// Map from template slug → available color themes. Only present if the template supports theming.
export const TEMPLATE_THEMES: Record<string, ThemeOption[]> = {
  clean: Object.entries(CLEAN_THEMES).map(([key, t]) => ({
    key,
    label: t.label,
    sidebarBg: t.accent, // accent-only template — use accent for both halves of swatch
    accent: t.accent,
  })),
  creative: Object.entries(CREATIVE_THEMES).map(([key, t]) => ({
    key,
    label: t.label,
    sidebarBg: t.sidebarBg,
    accent: t.accent,
  })),
  "elegant-dark": Object.entries(ELEGANT_DARK_THEMES).map(([key, t]) => ({
    key,
    label: t.label,
    sidebarBg: t.sidebarBg,
    accent: t.accent,
  })),
  "bold-photo": Object.entries(BOLD_PHOTO_THEMES).map(([key, t]) => ({
    key,
    label: t.label,
    sidebarBg: t.sidebarBg,
    accent: t.accent,
  })),
  "pro-sidebar": Object.entries(PRO_SIDEBAR_THEMES).map(([key, t]) => ({
    key,
    label: t.label,
    sidebarBg: t.sidebarBg,
    accent: t.accent,
  })),
  "soft-portrait": Object.entries(SOFT_PORTRAIT_THEMES).map(([key, t]) => ({
    key,
    label: t.label,
    sidebarBg: t.sidebarBg,
    accent: t.accent,
  })),
  geometric: Object.entries(GEOMETRIC_THEMES).map(([key, t]) => ({
    key,
    label: t.label,
    sidebarBg: t.sidebarBg,
    accent: t.accent,
  })),
  "bold-header": Object.entries(BOLD_HEADER_THEMES).map(([key, t]) => ({
    key,
    label: t.label,
    sidebarBg: t.sidebarBg,
    accent: t.accent,
  })),
  editorial: Object.entries(EDITORIAL_THEMES).map(([key, t]) => ({
    key,
    label: t.label,
    sidebarBg: t.sidebarBg,
    accent: t.accent,
  })),
  columnar: Object.entries(COLUMNAR_THEMES).map(([key, t]) => ({
    key,
    label: t.label,
    sidebarBg: t.sidebarBg,
    accent: t.accent,
  })),
};

export const registry: Record<string, TemplateComponent> = {
  clean: CleanTemplate,
  modern: ModernTemplate,
  creative: CreativeTemplate,
  elegant: ElegantTemplate,
  "elegant-single": ElegantSingleTemplate,
  "elegant-dark": ElegantDarkTemplate,
  "elegant-banner": ElegantBannerTemplate,
  "bold-photo": BoldPhotoTemplate,
  "pro-sidebar": ProSidebarTemplate,
  "soft-portrait": SoftPortraitTemplate,
  geometric: GeometricTemplate,
  "bold-header": BoldHeaderTemplate,
  editorial: EditorialTemplate,
  columnar: ColumnarTemplate,
};

export function getTemplate(slug: string): TemplateComponent {
  const component = registry[slug];
  if (!component) throw new Error(`Template not found: ${slug}`);
  return component;
}

export function getAllTemplateSlugs(): string[] {
  return Object.keys(registry);
}
