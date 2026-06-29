import { getOpenAIClient } from "./client";
import { callClaudeCli } from "./claudeCliClient";
import { callOpenCodeCli } from "./openCodeCliClient";
import { parseMatchResult } from "./outputSchemas";
import {
  MATCHING_SYSTEM_PROMPT,
  MATCHING_USER_PROMPT,
  OPTIMIZE_SYSTEM_PROMPT,
  OPTIMIZE_USER_PROMPT,
} from "./prompts/matching";
import { resumeSchema } from "@/lib/schemas/resume";
import { getActiveProvider } from "./aiConfig";
import type { AIProvider } from "./aiConfig";
import type { Resume } from "@/lib/schemas/resume";

export interface JobRequirements {
  requiredSkills: string[];
  preferredSkills: string[];
  experience: string;
  keywords: string[];
}

export interface MatchGap {
  type: "skill" | "experience" | "keyword";
  description: string;
  importance: "high" | "medium" | "low";
}

export interface MatchSuggestion {
  section: string;
  action: string;
  reason: string;
}

export interface MatchResult {
  matchScore: number;
  jobRequirements: JobRequirements;
  matchedSkills: string[];
  gaps: MatchGap[];
  suggestions: MatchSuggestion[];
  optimizedSummary: string;
  summary: string;
  /** Provider ou méthode qui a produit ce résultat. */
  provider: AIProvider | "heuristic";
}

// ─── Helpers par provider ─────────────────────────────────────────────────────

async function matchWithOpenAI(resume: Resume, jobDescription: string): Promise<MatchResult | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o";
  console.log(`[match] Appel OpenAI (${model})…`);
  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: MATCHING_SYSTEM_PROMPT },
        {
          role: "user",
          content: MATCHING_USER_PROMPT
            .replace("{jobDescription}", jobDescription)
            .replace("{resume}", JSON.stringify(resume, null, 2)),
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.warn("[match] OpenAI : réponse vide");
      return null;
    }

    const parsed = parseMatchResult(content);
    if (!parsed) {
      console.warn("[match] OpenAI : validation Zod échouée");
      return null;
    }

    console.log(`[match] OpenAI OK — score ${parsed.matchScore}%`);
    return { ...(parsed as MatchResult), provider: "openai" };
  } catch (err) {
    console.error("[match] OpenAI erreur :", err instanceof Error ? err.message : err);
    return null;
  }
}

async function matchWithClaudeCli(resume: Resume, jobDescription: string): Promise<MatchResult | null> {
  console.log("[match] Appel Claude CLI…");
  const userPrompt = MATCHING_USER_PROMPT
    .replace("{jobDescription}", jobDescription)
    .replace("{resume}", JSON.stringify(resume, null, 2));
  const raw = await callClaudeCli(MATCHING_SYSTEM_PROMPT, userPrompt);
  if (!raw) {
    console.warn("[match] Claude CLI : pas de réponse");
    return null;
  }
  const parsed = parseMatchResult(raw);
  if (!parsed) {
    console.warn("[match] Claude CLI : validation Zod échouée");
    return null;
  }
  console.log(`[match] Claude CLI OK — score ${parsed.matchScore}%`);
  return { ...(parsed as MatchResult), provider: "claude-cli" };
}

async function matchWithOpenCode(resume: Resume, jobDescription: string): Promise<MatchResult | null> {
  console.log("[match] Appel opencode CLI…");
  const userPrompt = MATCHING_USER_PROMPT
    .replace("{jobDescription}", jobDescription)
    .replace("{resume}", JSON.stringify(resume, null, 2));
  const raw = await callOpenCodeCli(MATCHING_SYSTEM_PROMPT, userPrompt);
  if (!raw) {
    console.warn("[match] opencode CLI : pas de réponse");
    return null;
  }
  const parsed = parseMatchResult(raw);
  if (!parsed) {
    console.warn("[match] opencode CLI : validation Zod échouée");
    return null;
  }
  console.log(`[match] opencode CLI OK — score ${parsed.matchScore}%`);
  return { ...(parsed as MatchResult), provider: "opencode" };
}

// ─── Entrées publiques ────────────────────────────────────────────────────────

export async function matchResumeToJob(
  resume: Resume,
  jobDescription: string
): Promise<MatchResult> {
  const provider = getActiveProvider();
  console.log(`[match] Provider actif : ${provider}`);

  let result: MatchResult | null = null;

  if (provider === "openai") {
    result = await matchWithOpenAI(resume, jobDescription);
  } else if (provider === "claude-cli") {
    result = await matchWithClaudeCli(resume, jobDescription);
  } else if (provider === "opencode") {
    result = await matchWithOpenCode(resume, jobDescription);
  }

  if (result) return result;

  console.log("[match] Fallback heuristique");
  return matchResumeToJobLocal(resume, jobDescription);
}

export async function optimizeResumeForJob(
  resume: Resume,
  jobDescription: string
): Promise<Resume> {
  const resumeText = JSON.stringify(resume, null, 2);
  const userPrompt = OPTIMIZE_USER_PROMPT
    .replace("{jobDescription}", jobDescription)
    .replace("{resume}", resumeText);

  const provider = getActiveProvider();
  console.log(`[optimize] Provider actif : ${provider}`);

  if (provider === "openai") {
    const client = getOpenAIClient();
    if (client) {
      const model = process.env.OPENAI_MODEL || "gpt-4o";
      console.log(`[optimize] Appel OpenAI (${model})…`);
      try {
        const response = await client.chat.completions.create({
          model,
          messages: [
            { role: "system", content: OPTIMIZE_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        });
        const content = response.choices[0]?.message?.content;
        if (content) {
          const r = resumeSchema.safeParse(JSON.parse(content));
          if (r.success) {
            console.log("[optimize] OpenAI OK");
            return r.data;
          }
          console.warn("[optimize] OpenAI : validation Zod échouée → CV inchangé");
        }
      } catch (err) {
        console.error("[optimize] OpenAI erreur :", err instanceof Error ? err.message : err);
      }
    }
  } else if (provider === "claude-cli") {
    console.log("[optimize] Appel Claude CLI…");
    const raw = await callClaudeCli(OPTIMIZE_SYSTEM_PROMPT, userPrompt);
    if (raw) {
      try {
        const r = resumeSchema.safeParse(JSON.parse(raw));
        if (r.success) {
          console.log("[optimize] Claude CLI OK");
          return r.data;
        }
        console.warn("[optimize] Claude CLI : validation Zod échouée → CV inchangé");
      } catch {
        console.warn("[optimize] Claude CLI : JSON invalide → CV inchangé");
      }
    }
  } else if (provider === "opencode") {
    console.log("[optimize] Appel opencode CLI…");
    const raw = await callOpenCodeCli(OPTIMIZE_SYSTEM_PROMPT, userPrompt);
    if (raw) {
      try {
        const r = resumeSchema.safeParse(JSON.parse(raw));
        if (r.success) {
          console.log("[optimize] opencode CLI OK");
          return r.data;
        }
        console.warn("[optimize] opencode CLI : validation Zod échouée → CV inchangé");
      } catch {
        console.warn("[optimize] opencode CLI : JSON invalide → CV inchangé");
      }
    }
  }

  console.log("[optimize] Aucun provider disponible — CV retourné inchangé");
  return resume;
}

// ─── Heuristique locale ───────────────────────────────────────────────────────

function matchResumeToJobLocal(resume: Resume, jobDescription: string): MatchResult {
  const jdLower = jobDescription.toLowerCase();

  const allResumeSkills: string[] = [];
  resume.skills?.forEach((s) => {
    if (s.name) allResumeSkills.push(s.name.toLowerCase());
    s.keywords?.forEach((kw) => allResumeSkills.push(kw.toLowerCase()));
  });

  const commonWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "can", "shall", "this", "that",
    "these", "those", "it", "its", "we", "our", "you", "your", "they",
    "their", "as", "not", "no", "if", "then", "than", "so", "de", "du",
    "la", "le", "les", "des", "un", "une", "et", "ou", "mais", "dans",
    "sur", "pour", "avec", "par", "est", "sont", "que", "qui",
  ]);

  const words = jdLower.match(/\b[a-zàâäéèêëïîôùûüÿç]{4,}\b/g) || [];
  const wordFreq: Record<string, number> = {};
  words.forEach((w) => {
    if (!commonWords.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  });

  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);

  const matchedSkills = allResumeSkills.filter((skill) =>
    keywords.some((kw) => skill.includes(kw) || kw.includes(skill))
  );

  const gapKeywords = keywords.filter(
    (kw) => !allResumeSkills.some((skill) => skill.includes(kw) || kw.includes(skill))
  );

  const gaps: MatchGap[] = gapKeywords.slice(0, 5).map((kw) => ({
    type: "keyword" as const,
    description: `Le mot-clé "${kw}" apparaît dans l'offre mais n'est pas présent dans votre CV`,
    importance: "medium" as const,
  }));

  const matchScore = Math.min(
    100,
    Math.round((matchedSkills.length / Math.max(keywords.length, 1)) * 60 + 20)
  );

  return {
    matchScore,
    jobRequirements: {
      requiredSkills: keywords.slice(0, 8),
      preferredSkills: keywords.slice(8, 15),
      experience: "Analyse locale limitée - utilisez l'IA pour une analyse détaillée",
      keywords,
    },
    matchedSkills,
    gaps,
    suggestions: gapKeywords.length > 0
      ? [{
          section: "skills",
          action: `Ajoutez les compétences suivantes si vous les possédez: ${gapKeywords.slice(0, 5).join(", ")}`,
          reason: "Ces mots-clés apparaissent fréquemment dans l'offre d'emploi",
        }]
      : [],
    optimizedSummary: resume.basics?.summary || "",
    summary: `Score de correspondance: ${matchScore}%. ${matchedSkills.length} compétences correspondent. ${gapKeywords.length} mots-clés potentiellement manquants. Activez l'IA pour une analyse plus précise.`,
    provider: "heuristic",
  };
}
