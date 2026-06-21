import { exportToYaml } from "./yaml";
import { exportToJson } from "./json";
import { exportToMarkdown } from "./markdown";
import type { Resume } from "@/lib/schemas/resume";

export type ExportFormat = "yaml" | "json" | "markdown";

export function exportResume(resume: Resume, format: ExportFormat): string {
  switch (format) {
    case "yaml":
      return exportToYaml(resume);
    case "json":
      return exportToJson(resume);
    case "markdown":
      return exportToMarkdown(resume);
  }
}

export function getExportMimeType(format: ExportFormat): string {
  switch (format) {
    case "yaml":
      return "text/yaml";
    case "json":
      return "application/json";
    case "markdown":
      return "text/markdown";
  }
}

export function getExportExtension(format: ExportFormat): string {
  switch (format) {
    case "yaml":
      return ".yml";
    case "json":
      return ".json";
    case "markdown":
      return ".md";
  }
}
