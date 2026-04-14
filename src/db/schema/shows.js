import { pgTable, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { movies } from "./movies.js";

export const shows = pgTable("shows", {
  id: uuid("id").primaryKey().defaultRandom(),

  movieId: uuid("movie_id")
    .references(() => movies.id)
    .notNull(),

  startTime: timestamp("start_time").notNull(),

  totalSeats: integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),
});
