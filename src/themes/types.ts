import type { Resume } from "@/lib/schemas/resume";
import type { ComponentType } from "react";
import type { ColorPalette } from "./palettes";

export interface ThemeProps {
  resume: Resume;
  colors?: Record<string, string>;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  preview: string;
  component: ComponentType<ThemeProps>;
  palettes: ColorPalette[];
}

export type ThemeId = "classic" | "modern" | "minimal" | "creative" | "compact"
  | "executive" | "aurora" | "swiss" | "neo" | "elegant" | "bold" | "lumiere";
