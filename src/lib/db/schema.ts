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
