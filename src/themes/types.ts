import type { Resume } from "@/lib/schemas/resume";
import type { ComponentType } from "react";

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  preview: string;
  component: ComponentType<{ resume: Resume }>;
}

export type ThemeId = "classic" | "modern" | "minimal" | "creative" | "compact";
