import type { Resume } from "@/lib/schemas/resume";

export function exportToJson(resume: Resume): string {
  return JSON.stringify(resume, null, 2);
}
