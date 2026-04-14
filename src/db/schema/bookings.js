import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { shows } from "./shows.js";
import { seats } from "./seats.js";
import { bookingStatusEnum } from "./enums.js";

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  showId: uuid("show_id")
    .references(() => shows.id)
    .notNull(),

  seatId: text("seat_id")
    .references(() => seats.id)
    .notNull(),

  status: bookingStatusEnum("status").default("pending"),

  createdAt: timestamp("created_at").defaultNow(),
});
