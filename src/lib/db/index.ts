import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "cv-builder.db");
const sqlite = new Database(dbPath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    data TEXT NOT NULL,
    theme TEXT NOT NULL DEFAULT 'modern',
    color_theme TEXT DEFAULT 'default',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    resume_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    score INTEGER NOT NULL,
    grade TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    resume_id TEXT NOT NULL,
    job_title TEXT,
    match_score INTEGER NOT NULL,
    version INTEGER NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

try {
  sqlite.exec(`ALTER TABLE resumes ADD COLUMN color_theme TEXT DEFAULT 'default'`);
} catch {
  // column already exists on pre-existing databases
}

export const db = drizzle(sqlite, { schema });
