import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { db } from "../src/lib/db/index";
import { resumes } from "../src/lib/db/schema";

const personas = [
  {
    name: "Marie Dupont",
    file: "sample-resume.json",
    theme: "modern",
  },
  {
    name: "SORE Zenatou",
    file: "sample-resume-sore.json",
    theme: "classic",
  },
  {
    name: "Zénatou SORÉ",
    file: "sample-resume-zenatou-sore-pv.json",
    theme: "lumiere",
    colorTheme: "default",
  },
];

function seed() {
  const existingCount = db.select().from(resumes).all().length;
  if (existingCount > 0) {
    console.log(`DB already has ${existingCount} resume(s). Skipping seed.`);
    console.log("To force re-seed, delete data/cv-builder.db first.");
    return;
  }

  const now = new Date();
  let total = 0;

  for (const persona of personas) {
    const samplePath = path.join(process.cwd(), "data", persona.file);

    if (!fs.existsSync(samplePath)) {
      console.error(`${persona.file} not found in data/. Skipping ${persona.name}.`);
      continue;
    }

    const sampleData = JSON.parse(fs.readFileSync(samplePath, "utf-8"));
    const id = nanoid();

    db.insert(resumes)
      .values({
        id,
        title: persona.name,
        data: sampleData,
        theme: persona.theme,
        colorTheme: persona.colorTheme ?? "default",
        createdAt: now,
        updatedAt: now,
      })
      .run();
    console.log(`  Created: ${persona.name} (${persona.theme}) (${id})`);
    total++;
  }

  console.log(`\nSeeded ${total} resumes.`);
}

seed();
