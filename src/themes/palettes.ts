export interface ColorPalette {
  id: string;
  name: string;
  swatch: string;
  colors: Record<string, string>;
}

export const modelPalettes: Record<string, ColorPalette[]> = {
  classic: [
    {
      id: "default",
      name: "Marine",
      swatch: "#1a1a2e",
      colors: { primary: "#1a1a2e", accent: "#4a4a6a" },
    },
    {
      id: "bordeaux",
      name: "Bordeaux",
      swatch: "#6b1a2e",
      colors: { primary: "#6b1a2e", accent: "#8b3a4a" },
    },
    {
      id: "foret",
      name: "Forêt",
      swatch: "#1a4a2e",
      colors: { primary: "#1a4a2e", accent: "#4a7a5a" },
    },
    {
      id: "ardoise",
      name: "Ardoise",
      swatch: "#2c3e50",
      colors: { primary: "#2c3e50", accent: "#5a7a8a" },
    },
  ],
  modern: [
    {
      id: "default",
      name: "Ardoise",
      swatch: "#334155",
      colors: {
        primary: "#2563eb",
        primaryLight: "#dbeafe",
        sidebarBg: "#334155",
        sidebarText: "#f1f5f9",
        sidebarMuted: "#94a3b8",
        accent: "#93c5fd",
      },
    },
    {
      id: "minuit",
      name: "Minuit",
      swatch: "#1e1b4b",
      colors: {
        primary: "#4f46e5",
        primaryLight: "#eef2ff",
        sidebarBg: "#1e1b4b",
        sidebarText: "#e0e7ff",
        sidebarMuted: "#818cf8",
        accent: "#a5b4fc",
      },
    },
    {
      id: "graphite-rose",
      name: "Graphite-Rose",
      swatch: "#292524",
      colors: {
        primary: "#e11d48",
        primaryLight: "#fff1f2",
        sidebarBg: "#292524",
        sidebarText: "#fafaf9",
        sidebarMuted: "#a8a29e",
        accent: "#fb7185",
      },
    },
    {
      id: "foret",
      name: "Forêt",
      swatch: "#14532d",
      colors: {
        primary: "#15803d",
        primaryLight: "#dcfce7",
        sidebarBg: "#14532d",
        sidebarText: "#f0fdf4",
        sidebarMuted: "#86efac",
        accent: "#4ade80",
      },
    },
    {
      id: "arctique",
      name: "Arctique",
      swatch: "#0c4a6e",
      colors: {
        primary: "#0284c7",
        primaryLight: "#e0f2fe",
        sidebarBg: "#0c4a6e",
        sidebarText: "#f0f9ff",
        sidebarMuted: "#7dd3fc",
        accent: "#38bdf8",
      },
    },
    {
      id: "ocean",
      name: "Océan",
      swatch: "#164e63",
      colors: {
        primary: "#0891b2",
        primaryLight: "#ecfeff",
        sidebarBg: "#164e63",
        sidebarText: "#ecfeff",
        sidebarMuted: "#67e8f9",
        accent: "#22d3ee",
      },
    },
    {
      id: "rouge",
      name: "Rouge",
      swatch: "#7f1d1d",
      colors: {
        primary: "#dc2626",
        primaryLight: "#fef2f2",
        sidebarBg: "#7f1d1d",
        sidebarText: "#fef2f2",
        sidebarMuted: "#fca5a5",
        accent: "#f87171",
      },
    },
  ],
  minimal: [
    {
      id: "default",
      name: "Encre",
      swatch: "#000000",
      colors: { primary: "#000000", accent: "#666666" },
    },
    {
      id: "ardoise",
      name: "Ardoise",
      swatch: "#1e293b",
      colors: { primary: "#1e293b", accent: "#64748b" },
    },
    {
      id: "chaleur",
      name: "Chaleur",
      swatch: "#292524",
      colors: { primary: "#292524", accent: "#78716c" },
    },
    {
      id: "sepia",
      name: "Sépia",
      swatch: "#3d2b1f",
      colors: { primary: "#3d2b1f", accent: "#92765a" },
    },
  ],
  creative: [
    {
      id: "default",
      name: "Violet",
      swatch: "#7c3aed",
      colors: {
        gradientStart: "#7c3aed",
        gradientEnd: "#2563eb",
        accent: "#f97316",
        accentLight: "#fff7ed",
        badgeBg: "#ede9fe",
        badgeText: "#6d28d9",
      },
    },
    {
      id: "coucher",
      name: "Coucher",
      swatch: "#f43f5e",
      colors: {
        gradientStart: "#f43f5e",
        gradientEnd: "#f97316",
        accent: "#facc15",
        accentLight: "#fefce8",
        badgeBg: "#ffe4e6",
        badgeText: "#e11d48",
      },
    },
    {
      id: "ocean",
      name: "Océan",
      swatch: "#0ea5e9",
      colors: {
        gradientStart: "#0ea5e9",
        gradientEnd: "#0d9488",
        accent: "#f43f5e",
        accentLight: "#fff1f2",
        badgeBg: "#e0f2fe",
        badgeText: "#0284c7",
      },
    },
    {
      id: "foret",
      name: "Forêt",
      swatch: "#16a34a",
      colors: {
        gradientStart: "#16a34a",
        gradientEnd: "#0d9488",
        accent: "#f97316",
        accentLight: "#fff7ed",
        badgeBg: "#dcfce7",
        badgeText: "#15803d",
      },
    },
  ],
  compact: [
    {
      id: "default",
      name: "Brique",
      swatch: "#7c2d12",
      colors: { primary: "#7c2d12", primaryLight: "#fef2f2" },
    },
    {
      id: "marine",
      name: "Marine",
      swatch: "#1e3a5f",
      colors: { primary: "#1e3a5f", primaryLight: "#eff6ff" },
    },
    {
      id: "foret",
      name: "Forêt",
      swatch: "#14532d",
      colors: { primary: "#14532d", primaryLight: "#f0fdf4" },
    },
    {
      id: "graphite",
      name: "Graphite",
      swatch: "#374151",
      colors: { primary: "#374151", primaryLight: "#f9fafb" },
    },
  ],
  executive: [
    {
      id: "default",
      name: "Or",
      swatch: "#C9A84C",
      colors: { gold: "#C9A84C", dark: "#1C1C1E", goldLight: "#F5EDD6" },
    },
    {
      id: "argent",
      name: "Argent",
      swatch: "#A8A9AD",
      colors: { gold: "#A8A9AD", dark: "#1C1C1E", goldLight: "#F0F0F2" },
    },
    {
      id: "saphir",
      name: "Saphir",
      swatch: "#1B3A6B",
      colors: { gold: "#4A7CC7", dark: "#1B3A6B", goldLight: "#E8F0FB" },
    },
    {
      id: "or-rose",
      name: "Or rose",
      swatch: "#C07A6A",
      colors: { gold: "#C07A6A", dark: "#2C1A1A", goldLight: "#FAF0EE" },
    },
  ],
  aurora: [
    {
      id: "default",
      name: "Aurora",
      swatch: "#6C63FF",
      colors: {
        accent: "#6C63FF",
        accentLight: "#EDE9FF",
        teal: "#0F9688",
        purple: "#C026D3",
        border: "#E2E0FF",
        cardBg: "#F8F9FF",
      },
    },
    {
      id: "coucher",
      name: "Coucher",
      swatch: "#F43F5E",
      colors: {
        accent: "#F43F5E",
        accentLight: "#FFE4E6",
        teal: "#F97316",
        purple: "#E11D48",
        border: "#FECDD3",
        cardBg: "#FFF1F2",
      },
    },
    {
      id: "cosmique",
      name: "Cosmique",
      swatch: "#9333EA",
      colors: {
        accent: "#9333EA",
        accentLight: "#F3E8FF",
        teal: "#EC4899",
        purple: "#7C3AED",
        border: "#E9D5FF",
        cardBg: "#FAF5FF",
      },
    },
    {
      id: "arctique",
      name: "Arctique",
      swatch: "#0EA5E9",
      colors: {
        accent: "#0EA5E9",
        accentLight: "#E0F2FE",
        teal: "#06B6D4",
        purple: "#3B82F6",
        border: "#BAE6FD",
        cardBg: "#F0F9FF",
      },
    },
  ],
  swiss: [
    {
      id: "default",
      name: "Rouge",
      swatch: "#D62828",
      colors: { red: "#D62828", black: "#111111" },
    },
    {
      id: "bleu",
      name: "Bleu",
      swatch: "#3b82f6",
      colors: { red: "#3b82f6", black: "#0a1628" },
    },
    {
      id: "vert",
      name: "Vert",
      swatch: "#16a34a",
      colors: { red: "#16a34a", black: "#0a1a0e" },
    },
    {
      id: "ambre",
      name: "Ambre",
      swatch: "#d97706",
      colors: { red: "#d97706", black: "#1a1000" },
    },
  ],
  neo: [
    {
      id: "default",
      name: "Matrix",
      swatch: "#39D353",
      colors: { neon: "#39D353", cyan: "#58A6FF" },
    },
    {
      id: "cyber",
      name: "Cyber",
      swatch: "#FF0080",
      colors: { neon: "#FF0080", cyan: "#BF00FF" },
    },
    {
      id: "glace",
      name: "Glace",
      swatch: "#22D3EE",
      colors: { neon: "#22D3EE", cyan: "#818CF8" },
    },
    {
      id: "ambre",
      name: "Ambre",
      swatch: "#F59E0B",
      colors: { neon: "#F59E0B", cyan: "#EF4444" },
    },
  ],
  elegant: [
    {
      id: "default",
      name: "Rose",
      swatch: "#C7736A",
      colors: {
        rose: "#C7736A",
        gold: "#B8922A",
        blush: "#F5E6E1",
        blushBorder: "#E8D5CE",
      },
    },
    {
      id: "lavande",
      name: "Lavande",
      swatch: "#8B7CB8",
      colors: {
        rose: "#8B7CB8",
        gold: "#C0A060",
        blush: "#EDE9F6",
        blushBorder: "#DDD5EE",
      },
    },
    {
      id: "sauge",
      name: "Sauge",
      swatch: "#6B8E78",
      colors: {
        rose: "#6B8E78",
        gold: "#A08040",
        blush: "#E9F0EC",
        blushBorder: "#D5E3DA",
      },
    },
    {
      id: "minuit",
      name: "Minuit",
      swatch: "#2C3E6B",
      colors: {
        rose: "#4A6BB8",
        gold: "#C0A060",
        blush: "#E9EDF6",
        blushBorder: "#D0D8EE",
      },
    },
  ],
  bold: [
    {
      id: "default",
      name: "Jaune",
      swatch: "#FFEB3B",
      colors: { yellow: "#FFEB3B", black: "#0A0A0A" },
    },
    {
      id: "corail",
      name: "Corail",
      swatch: "#FF6B6B",
      colors: { yellow: "#FF6B6B", black: "#0A0A0A" },
    },
    {
      id: "electrique",
      name: "Électrique",
      swatch: "#0066FF",
      colors: { yellow: "#0066FF", black: "#0A0A0A" },
    },
    {
      id: "lime",
      name: "Lime",
      swatch: "#32CD32",
      colors: { yellow: "#32CD32", black: "#0A0A0A" },
    },
  ],
  lumiere: [
    {
      id: "default",
      name: "Marine",
      swatch: "#2563eb",
      colors: {
        headerBg: "#dde8f2",
        headerBorder: "#b8cfe0",
        primary: "#1d3557",
        accent: "#2563eb",
        muted: "#64748b",
        border: "#e2e8f0",
        sidebarBg: "#eef3f8",
      },
    },
    {
      id: "ardoise",
      name: "Ardoise",
      swatch: "#475569",
      colors: {
        headerBg: "#e8edf2",
        headerBorder: "#c5cdd7",
        primary: "#1e293b",
        accent: "#475569",
        muted: "#64748b",
        border: "#e2e8f0",
        sidebarBg: "#edf0f4",
      },
    },
    {
      id: "sauge",
      name: "Sauge",
      swatch: "#2d6a4f",
      colors: {
        headerBg: "#ddeee6",
        headerBorder: "#a8d5bc",
        primary: "#1b4332",
        accent: "#2d6a4f",
        muted: "#52796f",
        border: "#d8eadf",
        sidebarBg: "#edf5ef",
      },
    },
    {
      id: "bordeaux",
      name: "Bordeaux",
      swatch: "#7f1d1d",
      colors: {
        headerBg: "#f2dede",
        headerBorder: "#d4a5a5",
        primary: "#450a0a",
        accent: "#7f1d1d",
        muted: "#9f5454",
        border: "#f5e0e0",
        sidebarBg: "#f7eded",
      },
    },
  ],
};

export function getModelPalettes(modelId: string): ColorPalette[] {
  return modelPalettes[modelId] ?? [];
}

export function resolveColorPalette(
  modelId: string,
  paletteId?: string
): ColorPalette | undefined {
  const palettes = modelPalettes[modelId];
  if (!palettes || palettes.length === 0) return undefined;
  if (!paletteId) return palettes[0];
  return palettes.find((p) => p.id === paletteId) ?? palettes[0];
}
