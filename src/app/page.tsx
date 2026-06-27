import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { HomePageClient } from "./HomePageClient";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const personas = [
  { name: "Marie Dupont", file: "sample-resume.json", theme: "modern" },
  { name: "SORE Zenatou", file: "sample-resume-sore.json", theme: "classic" },
];

function autoSeed() {
  const count = db.select().from(resumes).all().length;
  if (count > 0) return;

  const now = new Date();

  for (const persona of personas) {
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

  try {
    autoSeed();
    initialResumes = db.select().from(resumes).all();
  } catch {
    // DB might not exist yet
  }

  return <HomePageClient initialResumes={initialResumes as unknown as React.ComponentProps<typeof HomePageClient>["initialResumes"]} />;
}
