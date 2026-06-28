import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const resumes = sqliteTable("resumes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  data: text("data", { mode: "json" }).notNull(),
  theme: text("theme").notNull().default("modern"),
  colorTheme: text("color_theme").default("default"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  resumeId: text("resume_id").notNull(),
  version: integer("version").notNull(),
  score: integer("score").notNull(),
  grade: text("grade").notNull(),
  data: text("data", { mode: "json" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
