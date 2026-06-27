import type { Resume } from "@/lib/schemas/resume";
import { getTheme, type ThemeId } from "@/themes";

interface ThemeRendererProps {
  resume: Resume;
  themeId: ThemeId | string;
}

export function ThemeRenderer({ resume, themeId }: ThemeRendererProps) {
  const theme = getTheme(themeId);
  const Component = theme.component;
  return <Component resume={resume} />;
}
