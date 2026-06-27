import { load } from "js-yaml";
import { validateResume, type Resume } from "@/lib/schemas/resume";

export function parseYaml(content: string): {
  success: boolean;
  data?: Resume;
  errors?: string[];
} {
  try {
    const parsed = load(content);
    if (typeof parsed !== "object" || parsed === null) {
      return { success: false, errors: ["Le fichier YAML ne contient pas un objet valide"] };
    }
    return validateResume(parsed);
  } catch (e) {
    return {
      success: false,
      errors: [`Erreur de parsing YAML: ${e instanceof Error ? e.message : String(e)}`],
    };
  }
}
