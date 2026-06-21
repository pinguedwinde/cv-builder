import { dump } from "js-yaml";
import type { Resume } from "@/lib/schemas/resume";

function cleanEmpty(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    const filtered = obj.map(cleanEmpty).filter((v) => v !== undefined);
    return filtered.length > 0 ? filtered : undefined;
  }
  if (obj !== null && typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const cleanedValue = cleanEmpty(value);
      if (cleanedValue !== undefined && cleanedValue !== "" && cleanedValue !== null) {
        if (
          typeof cleanedValue === "object" &&
          !Array.isArray(cleanedValue) &&
          Object.keys(cleanedValue as Record<string, unknown>).length === 0
        ) {
          continue;
        }
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  return obj;
}

export function exportToYaml(resume: Resume): string {
  const cleaned = cleanEmpty(resume) ?? {};
  return dump(cleaned, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });
}
