import { eq, desc, inArray } from "drizzle-orm";
import { db } from "./index";
import { resumes, reviews, matches } from "./schema";
import { nanoid } from "nanoid";
import type { Resume } from "@/lib/schemas/resume";
import type { ReviewResult } from "@/lib/ai/review";
import type { MatchResult } from "@/lib/ai/matching";

export async function getAllResumes() {
  return db.select().from(resumes).orderBy(resumes.updatedAt);
}

export async function getResumeById(id: string) {
  const result = db.select().from(resumes).where(eq(resumes.id, id)).get();
  return result ?? null;
}

export async function createResume(data: {
  title: string;
  data: Resume;
  theme?: string;
  colorTheme?: string;
}) {
  const id = nanoid();
  const now = new Date();
  db.insert(resumes)
    .values({
      id,
      title: data.title,
      data: data.data,
      theme: data.theme ?? "modern",
      colorTheme: data.colorTheme ?? "default",
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return getResumeById(id);
}

export async function updateResume(
  id: string,
  data: Partial<{ title: string; data: Resume; theme: string; colorTheme: string }>
) {
  db.update(resumes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(resumes.id, id))
    .run();
  return getResumeById(id);
}

export async function deleteResume(id: string) {
  db.delete(resumes).where(eq(resumes.id, id)).run();
}

export async function duplicateResume(id: string) {
  const original = await getResumeById(id);
  if (!original) return null;
  return createResume({
    title: `${original.title} (copy)`,
    data: original.data as Resume,
    theme: original.theme,
    colorTheme: original.colorTheme ?? "default",
  });
}

// ─── Review queries ───────────────────────────────────────────────────────────

export function saveReview(resumeId: string, result: ReviewResult) {
  const history = getReviewHistory(resumeId);
  const version = history.length + 1;
  const id = nanoid();
  const now = new Date();
  db.insert(reviews)
    .values({
      id,
      resumeId,
      version,
      score: result.overallScore,
      grade: result.grade ?? "F",
      data: result as unknown as Record<string, unknown>,
      createdAt: now,
    })
    .run();
  return db.select().from(reviews).where(eq(reviews.id, id)).get()!;
}

export function getLatestReview(resumeId: string) {
  return (
    db
      .select()
      .from(reviews)
      .where(eq(reviews.resumeId, resumeId))
      .orderBy(desc(reviews.version))
      .limit(1)
      .get() ?? null
  );
}

export function getReviewByVersion(resumeId: string, version: number) {
  return (
    db
      .select()
      .from(reviews)
      .where(eq(reviews.resumeId, resumeId))
      .all()
      .find((r) => r.version === version) ?? null
  );
}

export function getReviewHistory(resumeId: string) {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.resumeId, resumeId))
    .orderBy(desc(reviews.version))
    .all();
}

export function getLatestReviewsSummary(
  resumeIds: string[]
): Record<string, { score: number; grade: string; version: number; createdAt: Date }> {
  if (resumeIds.length === 0) return {};
  const all = db
    .select()
    .from(reviews)
    .where(inArray(reviews.resumeId, resumeIds))
    .orderBy(desc(reviews.version))
    .all();
  const result: Record<string, { score: number; grade: string; version: number; createdAt: Date }> = {};
  for (const r of all) {
    if (!result[r.resumeId]) {
      result[r.resumeId] = { score: r.score, grade: r.grade, version: r.version, createdAt: r.createdAt };
    }
  }
  return result;
}

// ─── Match queries ────────────────────────────────────────────────────────────

export function saveMatch(
  resumeId: string,
  jobTitle: string | null,
  result: MatchResult,
  jobMeta?: { jobType?: string; jobUrl?: string; jobDescription?: string }
) {
  const history = getMatchHistory(resumeId);
  const version = history.length + 1;
  const id = nanoid();
  const now = new Date();
  db.insert(matches)
    .values({
      id,
      resumeId,
      jobTitle: jobTitle || null,
      jobType: jobMeta?.jobType ?? null,
      jobUrl: jobMeta?.jobUrl ?? null,
      jobDescription: jobMeta?.jobDescription ?? null,
      matchScore: result.matchScore,
      version,
      data: result as unknown as Record<string, unknown>,
      createdAt: now,
    })
    .run();
  return db.select().from(matches).where(eq(matches.id, id)).get()!;
}

export function getLatestMatch(resumeId: string) {
  return (
    db
      .select()
      .from(matches)
      .where(eq(matches.resumeId, resumeId))
      .orderBy(desc(matches.version))
      .limit(1)
      .get() ?? null
  );
}

export function getMatchByVersion(resumeId: string, version: number) {
  return (
    db
      .select()
      .from(matches)
      .where(eq(matches.resumeId, resumeId))
      .all()
      .find((m) => m.version === version) ?? null
  );
}

export function getMatchHistory(resumeId: string) {
  return db
    .select()
    .from(matches)
    .where(eq(matches.resumeId, resumeId))
    .orderBy(desc(matches.version))
    .all();
}

export function getLatestMatchesSummary(
  resumeIds: string[]
): Record<string, { matchScore: number; jobTitle: string | null; version: number; createdAt: Date }> {
  if (resumeIds.length === 0) return {};
  const all = db
    .select()
    .from(matches)
    .where(inArray(matches.resumeId, resumeIds))
    .orderBy(desc(matches.version))
    .all();
  const result: Record<string, { matchScore: number; jobTitle: string | null; version: number; createdAt: Date }> = {};
  for (const m of all) {
    if (!result[m.resumeId]) {
      result[m.resumeId] = { matchScore: m.matchScore, jobTitle: m.jobTitle, version: m.version, createdAt: m.createdAt };
    }
  }
  return result;
}
