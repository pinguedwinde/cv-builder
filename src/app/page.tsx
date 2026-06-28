import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { getLatestReviewsSummary } from "@/lib/db/queries";
import { HomePageClient } from "./HomePageClient";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const personas = [
  { name: "Marie Dupont", file: "sample-resume.json", theme: "modern" },
  { name: "SORE Zenatou", file: "sample-resume-sore.json", theme: "classic" },
  { name: "Zénatou SORÉ — Chef de Projet PV", file: "sample-resume-zenatou-sore-pv.json", theme: "executive" },
  { name: "Zénatou SORÉ — Ingénieure IRVE", file: "sample-resume-zenatou-sore-irve.json", theme: "aurora" },
  { name: "Zénatou SORÉ — CFO/CFA SSI", file: "sample-resume-zenatou-sore-cfo-cfa-ssi.json", theme: "swiss" },
];

function autoSeed() {
  const existing = db.select().from(resumes).all();
  const existingTitles = new Set(existing.map((r) => r.title));
  const now = new Date();

  for (const persona of personas) {
    if (existingTitles.has(persona.name)) continue;
    const samplePath = path.join(process.cwd(), "data", persona.file);
    if (!fs.existsSync(samplePath)) continue;

    const sampleData = JSON.parse(fs.readFileSync(samplePath, "utf-8"));
    db.insert(resumes)
      .values({
        id: nanoid(),
        title: persona.name,
        data: sampleData,
        theme: persona.theme,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }
}

export default async function HomePage() {
  let initialResumes: Array<{
    id: string;
    title: string;
    theme: string;
    data: unknown;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  let reviewsSummary: Record<string, { score: number; grade: string; version: number; createdAt: Date }> = {};

  try {
    autoSeed();
    initialResumes = db.select().from(resumes).all();
    reviewsSummary = getLatestReviewsSummary(initialResumes.map((r) => r.id));
  } catch {
    // DB might not exist yet
  }

  return (
    <HomePageClient
      initialResumes={initialResumes as unknown as React.ComponentProps<typeof HomePageClient>["initialResumes"]}
      initialReviewsSummary={reviewsSummary as unknown as React.ComponentProps<typeof HomePageClient>["initialReviewsSummary"]}
    />
  );
}
