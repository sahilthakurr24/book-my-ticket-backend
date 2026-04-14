import { pgTable, uuid, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";

export const movies = pgTable("movies", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // minutes
  language: varchar("language", { length: 50 }),
  genre: varchar("genre", { length: 100 }),
  releaseDate: timestamp("release_date"),

  createdAt: timestamp("created_at").defaultNow(),
});