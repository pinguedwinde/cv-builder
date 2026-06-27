import { getOpenAIClient, isAIEnabled } from "./client";
import {
  MATCHING_SYSTEM_PROMPT,
  MATCHING_USER_PROMPT,
  OPTIMIZE_SYSTEM_PROMPT,
  OPTIMIZE_USER_PROMPT,
} from "./prompts/matching";
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
}

export async function matchResumeToJob(
  resume: Resume,
  jobDescription: string
): Promise<MatchResult> {
  const client = getOpenAIClient();

  if (!client || !isAIEnabled()) {
    return matchResumeToJobLocal(resume, jobDescription);
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o";
  const resumeText = JSON.stringify(resume, null, 2);

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: MATCHING_SYSTEM_PROMPT },
        {
          role: "user",
          content: MATCHING_USER_PROMPT
            .replace("{jobDescription}", jobDescription)
            .replace("{resume}", resumeText),
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return matchResumeToJobLocal(resume, jobDescription);
    }

    return JSON.parse(content) as MatchResult;
  } catch {
    return matchResumeToJobLocal(resume, jobDescription);
  }
}

export async function optimizeResumeForJob(
  resume: Resume,
  jobDescription: string
): Promise<Resume> {
  const client = getOpenAIClient();

  if (!client || !isAIEnabled()) {
    return resume;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o";
  const resumeText = JSON.stringify(resume, null, 2);

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: OPTIMIZE_SYSTEM_PROMPT },
        {
          role: "user",
          content: OPTIMIZE_USER_PROMPT
            .replace("{jobDescription}", jobDescription)
            .replace("{resume}", resumeText),
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return resume;
    }

    return JSON.parse(content) as Resume;
  } catch {
    return resume;
  }
}

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
  };
}
