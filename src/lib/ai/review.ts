import { getOpenAIClient, isAIEnabled } from "./client";
import { callClaudeCli } from "./claudeCliClient";
import { parseReviewResult } from "./outputSchemas";
import { REVIEW_SYSTEM_PROMPT, buildReviewUserPrompt } from "./prompts/review";
import { scoreToGrade } from "./criteria/review";
import type { Resume } from "@/lib/schemas/resume";

// ─── Types exportés (consommés par l'UI) ─────────────────────────────────────

export interface ReviewChecklist {
  label: string;
  passed: boolean;
}

export interface ReviewCategory {
  score: number;
  maxScore: number;
  label: string;
  details: string;
  checklist?: ReviewChecklist[];
}

export interface ReviewSuggestion {
  section: string;
  criterion?: string;
  severity: "critical" | "warning" | "info";
  message: string;
  rewrite?: {
    original: string;
    improved: string;
  };
}

export interface ReviewResult {
  overallScore: number;
  grade?: "A" | "B" | "C" | "D" | "F";
  categories: {
    completeness: ReviewCategory;
    impact: ReviewCategory;
    clarity: ReviewCategory;
    relevance: ReviewCategory;
    formatting: ReviewCategory;
  };
  strengths?: string[];
  suggestions: ReviewSuggestion[];
  summary: string;
}

// ─── Fallback local (sans IA) ─────────────────────────────────────────────────

export function reviewResumeLocal(resume: Resume): ReviewResult {
  let completenessScore = 0;
  const suggestions: ReviewSuggestion[] = [];

  if (resume.basics?.name) completenessScore += 3;
  else suggestions.push({ section: "basics", criterion: "completeness", severity: "critical", message: "Le nom est manquant" });

  if (resume.basics?.email) completenessScore += 3;
  else suggestions.push({ section: "basics", criterion: "completeness", severity: "critical", message: "L'email est manquant" });

  if (resume.basics?.phone) completenessScore += 2;
  else suggestions.push({ section: "basics", criterion: "completeness", severity: "warning", message: "Le numéro de téléphone est manquant" });

  if (resume.basics?.label) completenessScore += 2;
  else suggestions.push({ section: "basics", criterion: "completeness", severity: "warning", message: "Le titre / poste actuel est manquant" });

  if (resume.basics?.summary && resume.basics.summary.length > 50) completenessScore += 4;
  else if (!resume.basics?.summary) suggestions.push({ section: "basics", criterion: "completeness", severity: "critical", message: "Le résumé/profil est manquant. Ajoutez 2-3 phrases décrivant votre profil." });
  else suggestions.push({ section: "basics", criterion: "completeness", severity: "warning", message: "Le résumé est trop court. Développez-le avec 2-3 phrases." });

  if (resume.work && resume.work.length > 0) {
    completenessScore += 2;
    resume.work.forEach((w, i) => {
      if (!w.highlights || w.highlights.length < 2) {
        suggestions.push({
          section: "work",
          criterion: "impact",
          severity: "warning",
          message: `L'expérience "${w.name || `#${i + 1}`}" manque de highlights. Ajoutez au moins 2 réalisations concrètes.`,
        });
      }
      if (w.highlights) {
        w.highlights.forEach((h) => {
          if (!/\d/.test(h)) {
            suggestions.push({
              section: "work",
              criterion: "impact",
              severity: "info",
              message: `"${h.substring(0, 50)}…" pourrait être amélioré avec des métriques chiffrées.`,
            });
          }
        });
      }
    });
  } else {
    suggestions.push({ section: "work", criterion: "completeness", severity: "critical", message: "Aucune expérience professionnelle renseignée." });
  }

  if (resume.education && resume.education.length > 0) completenessScore += 2;
  else suggestions.push({ section: "education", criterion: "completeness", severity: "warning", message: "Aucune formation renseignée." });

  if (resume.skills && resume.skills.length > 0) completenessScore += 2;
  else suggestions.push({ section: "skills", criterion: "completeness", severity: "warning", message: "Aucune compétence renseignée." });

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

  const clarityScore = Math.min(20,
    10 +
    (resume.basics?.summary && resume.basics.summary.length < 500 ? 5 : 0) +
    (resume.work?.every((w) => (w.summary?.length || 0) < 300) ? 5 : 0)
  );
  const relevanceScore = Math.min(20, 10 + (resume.skills?.length || 0) * 2);
  const formattingScore = Math.min(20, completenessScore + 2);

  const overallScore = Math.min(100, completenessScore + impactScore + clarityScore + relevanceScore + formattingScore);

  return {
    overallScore,
    grade: scoreToGrade(overallScore),
    categories: {
      completeness: { score: completenessScore, maxScore: 20, label: "Complétude", details: `${completenessScore}/20 — Sections ${completenessScore >= 15 ? "bien" : "partiellement"} remplies` },
      impact:       { score: impactScore,       maxScore: 20, label: "Impact",     details: `${impactScore}/20 — ${impactScore >= 12 ? "Bon usage" : "Peu d'usage"} de métriques et verbes d'action` },
      clarity:      { score: clarityScore,      maxScore: 20, label: "Clarté",     details: `${clarityScore}/20 — Texte ${clarityScore >= 14 ? "clair et concis" : "à améliorer en concision"}` },
      relevance:    { score: relevanceScore,    maxScore: 20, label: "Pertinence", details: `${relevanceScore}/20 — Mots-clés ${relevanceScore >= 14 ? "pertinents" : "à enrichir"}` },
      formatting:   { score: formattingScore,   maxScore: 20, label: "Formatage",  details: `${formattingScore}/20 — Structure ${formattingScore >= 14 ? "cohérente" : "à améliorer"}` },
    },
    strengths: [],
    suggestions,
    summary: overallScore >= 75
      ? "CV de bonne qualité. Quelques améliorations possibles pour maximiser l'impact."
      : overallScore >= 60
        ? "CV avec une base correcte mais nécessitant des améliorations significatives."
        : "CV incomplet. Il manque des sections essentielles et le contenu doit être développé.",
  };
}

// ─── Analyse IA ───────────────────────────────────────────────────────────────

export async function reviewResumeAI(resume: Resume): Promise<ReviewResult> {
  const client = getOpenAIClient();
  if (!client) {
    console.log("[review] OpenAI client unavailable → fallback heuristique");
    return reviewResumeLocal(resume);
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o";
  console.log(`[review] Appel OpenAI (${model})…`);

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: REVIEW_SYSTEM_PROMPT },
        { role: "user", content: buildReviewUserPrompt(resume) },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.warn("[review] OpenAI : réponse vide → fallback heuristique");
      return reviewResumeLocal(resume);
    }

    const parsed = parseReviewResult(content);
    if (!parsed) {
      console.warn("[review] OpenAI : validation Zod échouée → fallback heuristique");
      return reviewResumeLocal(resume);
    }

    console.log(`[review] OpenAI OK — score ${parsed.overallScore}/100 (${parsed.grade})`);
    return parsed as ReviewResult;
  } catch (err) {
    console.error("[review] OpenAI erreur :", err instanceof Error ? err.message : err);
    return reviewResumeLocal(resume);
  }
}

async function reviewResumeClaudeCli(resume: Resume): Promise<ReviewResult | null> {
  console.log("[review] Appel Claude CLI…");
  const raw = await callClaudeCli(REVIEW_SYSTEM_PROMPT, buildReviewUserPrompt(resume));
  if (!raw) {
    console.warn("[review] Claude CLI : pas de réponse");
    return null;
  }
  const parsed = parseReviewResult(raw);
  if (!parsed) {
    console.warn("[review] Claude CLI : validation Zod échouée");
    return null;
  }
  console.log(`[review] Claude CLI OK — score ${parsed.overallScore}/100 (${parsed.grade})`);
  return parsed as ReviewResult;
}

export async function reviewResume(resume: Resume): Promise<ReviewResult> {
  if (isAIEnabled()) return reviewResumeAI(resume);

  const cliResult = await reviewResumeClaudeCli(resume);
  if (cliResult) return cliResult;

  console.log("[review] Fallback heuristique");
  return reviewResumeLocal(resume);
}
