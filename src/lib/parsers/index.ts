import { parseYaml } from "./yaml";
import { parseJson } from "./json";
import type { Resume } from "@/lib/schemas/resume";

export type ParseResult = {
  success: boolean;
  data?: Resume;
  errors?: string[];
  format?: "yaml" | "json";
};

function detectFormat(content: string): "yaml" | "json" {
  const trimmed = content.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return "json";
  }
  return "yaml";
}

export function parseResume(content: string, format?: "yaml" | "json"): ParseResult {
  const detectedFormat = format ?? detectFormat(content);

  if (detectedFormat === "json") {
    const result = parseJson(content);
    return { ...result, format: "json" };
  }

  const result = parseYaml(content);
  if (!result.success && !format) {
    const jsonResult = parseJson(content);
    if (jsonResult.success) {
      return { ...jsonResult, format: "json" };
    }
  }
  return { ...result, format: "yaml" };
}
