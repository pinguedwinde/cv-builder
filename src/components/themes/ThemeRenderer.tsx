import type { Resume } from "@/lib/schemas/resume";
import { getTheme, type ThemeId } from "@/themes";
import { resolveColorPalette } from "@/themes/palettes";

interface ThemeRendererProps {
  resume: Resume;
  themeId: ThemeId | string;
  colorThemeId?: string;
}

export function ThemeRenderer({ resume, themeId, colorThemeId }: ThemeRendererProps) {
  const theme = getTheme(themeId);
  const Component = theme.component;
  const palette = resolveColorPalette(themeId, colorThemeId);
  return <Component resume={resume} colors={palette?.colors} />;
}
