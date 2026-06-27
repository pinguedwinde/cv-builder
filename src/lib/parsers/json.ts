import { validateResume, type Resume } from "@/lib/schemas/resume";

export function parseJson(content: string): {
  success: boolean;
  data?: Resume;
  errors?: string[];
} {
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed !== "object" || parsed === null) {
      return { success: false, errors: ["Le JSON ne contient pas un objet valide"] };
    }
    return validateResume(parsed);
  } catch (e) {
    return {
      success: false,
      errors: [`Erreur de parsing JSON: ${e instanceof Error ? e.message : String(e)}`],
    };
  }
}
