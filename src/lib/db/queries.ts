import { eq } from "drizzle-orm";
import { db } from "./index";
import { resumes } from "./schema";
import { nanoid } from "nanoid";
import type { Resume } from "@/lib/schemas/resume";

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
