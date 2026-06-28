import type { ThemeConfig, ThemeId } from "./types";
import { modelPalettes, resolveColorPalette } from "./palettes";
import { ClassicTheme } from "./classic";
import { ModernTheme } from "./modern";
import { MinimalTheme } from "./minimal";
import { CreativeTheme } from "./creative";
import { CompactTheme } from "./compact";
import { ExecutiveTheme } from "./executive";
import { AuroraTheme } from "./aurora";
import { SwissTheme } from "./swiss";
import { NeoTheme } from "./neo";
import { ElegantTheme } from "./elegant";
import { BoldTheme } from "./bold";

export const themes: Record<ThemeId, ThemeConfig> = {
  classic: {
    id: "classic",
    name: "Classique",
    description: "Traditionnel et elegant, serif, une colonne",
    preview: "Serif · Noir/Bleu marine · 1 colonne",
    component: ClassicTheme,
    palettes: modelPalettes.classic ?? [],
  },
  modern: {
    id: "modern",
    name: "Moderne",
    description: "Deux colonnes avec sidebar, design aere",
    preview: "Sans-serif · Bleu/Gris · 2 colonnes",
    component: ModernTheme,
    palettes: modelPalettes.modern ?? [],
  },
  minimal: {
    id: "minimal",
    name: "Minimaliste",
    description: "Ultra-epure, monospace, noir et blanc",
    preview: "Mono · Noir/Blanc · 1 colonne",
    component: MinimalTheme,
    palettes: modelPalettes.minimal ?? [],
  },
  creative: {
    id: "creative",
    name: "Creatif",
    description: "Design audacieux avec gradient et cards",
    preview: "Poppins · Gradient violet · Cards",
    component: CreativeTheme,
    palettes: modelPalettes.creative ?? [],
  },
  compact: {
    id: "compact",
    name: "Compact",
    description: "Dense et professionnel, optimise multi-pages",
    preview: "Source Sans · Gris/Bordeaux · 2 colonnes",
    component: CompactTheme,
    palettes: modelPalettes.compact ?? [],
  },
  executive: {
    id: "executive",
    name: "Executif",
    description: "Premium avec accents dores, cadres dirigeants",
    preview: "Playfair · Or/Noir · 1 colonne",
    component: ExecutiveTheme,
    palettes: modelPalettes.executive ?? [],
  },
  aurora: {
    id: "aurora",
    name: "Aurora",
    description: "Header degrade aurora, cartes rondes, jeune pro",
    preview: "Outfit · Teal/Violet · Cards",
    component: AuroraTheme,
    palettes: modelPalettes.aurora ?? [],
  },
  swiss: {
    id: "swiss",
    name: "Swiss",
    description: "Grille suisse, typographie forte, rouge et noir",
    preview: "Barlow Condensed · Rouge/Noir · 2 col",
    component: SwissTheme,
    palettes: modelPalettes.swiss ?? [],
  },
  neo: {
    id: "neo",
    name: "Neo",
    description: "Terminal sombre, vert neon, pour developpeurs",
    preview: "JetBrains Mono · Vert neon · Dark",
    component: NeoTheme,
    palettes: modelPalettes.neo ?? [],
  },
  elegant: {
    id: "elegant",
    name: "Elegant",
    description: "Rose dore et champagne, typographie raffinees",
    preview: "Cormorant · Rose/Or · 1 colonne",
    component: ElegantTheme,
    palettes: modelPalettes.elegant ?? [],
  },
  bold: {
    id: "bold",
    name: "Bold",
    description: "Typographie XXL, bandes noir/jaune, magazine",
    preview: "Bebas Neue · Noir/Jaune · Magazine",
    component: BoldTheme,
    palettes: modelPalettes.bold ?? [],
  },
};

export const themeIds = Object.keys(themes) as ThemeId[];

export function getTheme(id: string): ThemeConfig {
  return themes[id as ThemeId] ?? themes.modern;
}

export { resolveColorPalette, getModelPalettes } from "./palettes";
export type { ThemeConfig, ThemeId };
