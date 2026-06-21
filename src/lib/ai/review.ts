import { getOpenAIClient, isAIEnabled } from "./client";
import { REVIEW_SYSTEM_PROMPT, REVIEW_USER_PROMPT } from "./prompts/review";
import type { Resume } from "@/lib/schemas/resume";

export interface ReviewSuggestion {
  section: string;
  severity: "critical" | "warning" | "info";
  message: string;
  rewrite?: {
    original: string;
    improved: string;
  };
}

export interface ReviewCategory {
  score: number;
  details: string;
}

export interface ReviewResult {
  overallScore: number;
  categories: {
    completeness: ReviewCategory;
    impact: ReviewCategory;
    clarity: ReviewCategory;
    relevance: ReviewCategory;
    formatting: ReviewCategory;
  };
  suggestions: ReviewSuggestion[];
  summary: string;
}

function resumeToText(resume: Resume): string {
  return JSON.stringify(resume, null, 2);
}

export function reviewResumeLocal(resume: Resume): ReviewResult {
  let completenessScore = 0;
  const suggestions: ReviewSuggestion[] = [];

  if (resume.basics?.name) completenessScore += 3;
  else suggestions.push({ section: "basics", severity: "critical", message: "Le nom est manquant" });

  if (resume.basics?.email) completenessScore += 3;
  else suggestions.push({ section: "basics", severity: "critical", message: "L'email est manquant" });

  if (resume.basics?.phone) completenessScore += 2;
  else suggestions.push({ section: "basics", severity: "warning", message: "Le numéro de téléphone est manquant" });

  if (resume.basics?.summary && resume.basics.summary.length > 50) completenessScore += 4;
  else if (!resume.basics?.summary) suggestions.push({ section: "basics", severity: "critical", message: "Le résumé/profil est manquant. Ajoutez 2-3 phrases décrivant votre profil." });
  else suggestions.push({ section: "basics", severity: "warning", message: "Le résumé est trop court. Développez-le avec 2-3 phrases." });

  if (resume.work && resume.work.length > 0) {
    completenessScore += 4;
    resume.work.forEach((w, i) => {
      if (!w.highlights || w.highlights.length === 0) {
        suggestions.push({
          section: "work",
          severity: "warning",
          message: `L'expérience "${w.name || `#${i + 1}`}" n'a pas de points clés (highlights). Ajoutez des réalisations concrètes.`,
        });
      }
      if (w.highlights) {
        w.highlights.forEach((h) => {
          if (!/\d/.test(h)) {
            suggestions.push({
              section: "work",
              severity: "info",
              message: `Le point clé "${h.substring(0, 50)}..." pourrait être amélioré avec des métriques chiffrées.`,
            });
          }
        });
      }
    });
  } else {
    suggestions.push({ section: "work", severity: "critical", message: "Aucune expérience professionnelle renseignée." });
  }

  if (resume.education && resume.education.length > 0) completenessScore += 2;
  else suggestions.push({ section: "education", severity: "warning", message: "Aucune formation renseignée." });

  if (resume.skills && resume.skills.length > 0) completenessScore += 2;
  else suggestions.push({ section: "skills", severity: "warning", message: "Aucune compétence renseignée." });

  const impactScore = Math.min(20, (resume.work?.reduce((acc, w) => {
    let score = 0;
    if (w.highlights) {
      w.highlights.forEach((h) => {
        if (/\d+%|\d+\+|\d+k|\d+M|\d+x/i.test(h)) score += 3;
        if (/^(Led|Managed|Built|Designed|Developed|Implemented|Optimized|Reduced|Increased|Launched|Created|Delivered)/i.test(h)) score += 2;
      });
    }
    return acc + score;
  }, 0) || 0));

  const clarityScore = Math.min(20, 10 + (resume.basics?.summary && resume.basics.summary.length < 300 ? 5 : 0) + (resume.work?.every((w) => (w.summary?.length || 0) < 200) ? 5 : 0));
  const relevanceScore = Math.min(20, 10 + (resume.skills?.length || 0) * 2);
  const formattingScore = Math.min(20, completenessScore + 2);

  const overallScore = Math.min(100, completenessScore + impactScore + clarityScore + relevanceScore + formattingScore);

  return {
    overallScore,
    categories: {
      completeness: { score: completenessScore, details: `${completenessScore}/20 - Sections ${completenessScore >= 15 ? "bien" : "partiellement"} remplies` },
      impact: { score: impactScore, details: `${impactScore}/20 - ${impactScore >= 12 ? "Bon usage" : "Peu d'usage"} de métriques et verbes d'action` },
      clarity: { score: clarityScore, details: `${clarityScore}/20 - Texte ${clarityScore >= 14 ? "clair et concis" : "à améliorer en concision"}` },
      relevance: { score: relevanceScore, details: `${relevanceScore}/20 - Mots-clés ${relevanceScore >= 14 ? "pertinents" : "à enrichir"}` },
      formatting: { score: formattingScore, details: `${formattingScore}/20 - Structure ${formattingScore >= 14 ? "cohérente" : "à améliorer"}` },
    },
    suggestions,
    summary: overallScore >= 70
      ? "CV de bonne qualité. Quelques améliorations possibles pour maximiser l'impact."
      : overallScore >= 40
        ? "CV avec une base correcte mais nécessitant des améliorations significatives."
        : "CV incomplet. Il manque des sections essentielles et le contenu doit être développé.",
  };
}

export async function reviewResumeAI(resume: Resume): Promise<ReviewResult> {
  const client = getOpenAIClient();
  if (!client) {
    return reviewResumeLocal(resume);
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o";
  const resumeText = resumeToText(resume);

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: REVIEW_SYSTEM_PROMPT },
        { role: "user", content: REVIEW_USER_PROMPT.replace("{resume}", resumeText) },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return reviewResumeLocal(resume);
    }

    const parsed = JSON.parse(content) as ReviewResult;
    return parsed;
  } catch {
    return reviewResumeLocal(resume);
  }
}

export async function reviewResume(resume: Resume): Promise<ReviewResult> {
  if (isAIEnabled()) {
    return reviewResumeAI(resume);
  }
  return reviewResumeLocal(resume);
}
