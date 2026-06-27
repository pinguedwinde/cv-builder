import type { ThemeConfig, ThemeId } from "./types";
import { ClassicTheme } from "./classic";
import { ModernTheme } from "./modern";
import { MinimalTheme } from "./minimal";
import { CreativeTheme } from "./creative";
import { CompactTheme } from "./compact";

export const themes: Record<ThemeId, ThemeConfig> = {
  classic: {
    id: "classic",
    name: "Classique",
    description: "Traditionnel et élégant, serif, une colonne",
    preview: "Serif · Noir/Bleu marine · 1 colonne",
    component: ClassicTheme,
  },
  modern: {
    id: "modern",
    name: "Moderne",
    description: "Deux colonnes avec sidebar, design aéré",
    preview: "Sans-serif · Bleu/Gris · 2 colonnes",
    component: ModernTheme,
  },
  minimal: {
    id: "minimal",
    name: "Minimaliste",
    description: "Ultra-épuré, monospace, noir et blanc",
    preview: "Mono · Noir/Blanc · 1 colonne",
    component: MinimalTheme,
  },
  creative: {
    id: "creative",
    name: "Créatif",
    description: "Design audacieux avec gradient et cards",
    preview: "Poppins · Gradient violet · Cards",
    component: CreativeTheme,
  },
  compact: {
    id: "compact",
    name: "Compact",
    description: "Dense et professionnel, optimisé multi-pages",
    preview: "Source Sans · Gris/Bordeaux · 2 colonnes",
    component: CompactTheme,
  },
};

export const themeIds = Object.keys(themes) as ThemeId[];

export function getTheme(id: string): ThemeConfig {
  return themes[id as ThemeId] ?? themes.modern;
}

export type { ThemeConfig, ThemeId };
