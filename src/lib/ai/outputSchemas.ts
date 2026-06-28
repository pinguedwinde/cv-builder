import { z } from "zod";

// ─── Review ───────────────────────────────────────────────────────────────────

const reviewChecklistItemSchema = z.object({
  label: z.string(),
  passed: z.boolean(),
});

const reviewCategorySchema = z.object({
  score: z.number().int().min(0).max(20),
  maxScore: z.number().int().positive(),
  label: z.string().min(1),
  details: z.string(),
  checklist: z.array(reviewChecklistItemSchema).default([]),
});

const reviewSuggestionSchema = z.object({
  section: z.string().min(1),
  criterion: z.string().optional(),
  severity: z.enum(["critical", "warning", "info"]),
  message: z.string().min(1),
  rewrite: z.object({
    original: z.string(),
    improved: z.string(),
  }).optional(),
});

export const reviewResultSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  grade: z.enum(["A", "B", "C", "D", "F"]),
  categories: z.object({
    completeness: reviewCategorySchema,
    impact: reviewCategorySchema,
    clarity: reviewCategorySchema,
    relevance: reviewCategorySchema,
    formatting: reviewCategorySchema,
  }),
  strengths: z.array(z.string()).default([]),
  suggestions: z.array(reviewSuggestionSchema).default([]),
  summary: z.string().min(1),
});

// ─── Matching ─────────────────────────────────────────────────────────────────

const matchGapSchema = z.object({
  type: z.enum(["skill", "experience", "keyword"]),
  description: z.string().min(1),
  importance: z.enum(["high", "medium", "low"]),
});

const matchSuggestionSchema = z.object({
  section: z.string().min(1),
  action: z.string().min(1),
  reason: z.string().min(1),
});

export const matchResultSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  jobRequirements: z.object({
    requiredSkills: z.array(z.string()).default([]),
    preferredSkills: z.array(z.string()).default([]),
    experience: z.string().default(""),
    keywords: z.array(z.string()).default([]),
  }),
  matchedSkills: z.array(z.string()).default([]),
  gaps: z.array(matchGapSchema).default([]),
  suggestions: z.array(matchSuggestionSchema).default([]),
  optimizedSummary: z.string().default(""),
  summary: z.string().min(1),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function parseReviewResult(raw: string): z.infer<typeof reviewResultSchema> | null {
  try {
    const parsed = JSON.parse(raw);
    const result = reviewResultSchema.safeParse(parsed);
    if (!result.success) {
      console.error("[parseReviewResult] Zod errors:", JSON.stringify(result.error.issues, null, 2));
    }
    return result.success ? result.data : null;
  } catch (err) {
    console.error("[parseReviewResult] JSON.parse failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

export function parseMatchResult(raw: string): z.infer<typeof matchResultSchema> | null {
  try {
    const parsed = JSON.parse(raw);
    const result = matchResultSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
