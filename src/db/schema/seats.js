import { pgTable, text, boolean , uuid} from "drizzle-orm/pg-core";
import { shows } from "./shows.js";

export const seats = pgTable("seats", {
  id: text("id").primaryKey(),

  showId: uuid("show_id")
    .references(() => shows.id)
    .notNull(),

  seatNumber: text("seat_number").notNull(),

  isBooked: boolean("is_booked").default(false),
});
