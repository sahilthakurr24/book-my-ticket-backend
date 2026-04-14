import { db } from "../../db/index.js";
import { seats } from "../../db/schema/seats.js";
import { shows } from "../../db/schema/shows.js";
import { bookings } from "../../db/schema/bookings.js";
import ApiError from "../../common/utils/api-error.js";
import { firstZodIssueMessage } from "../../common/utils/zod-error-message.js";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

const createBookingSchema = z.object({
  showId: z.string().uuid(),
  seatId: z.string().min(1),
});

export async function createBooking({ userId, body }) {
  let data;
  try {
    data = createBookingSchema.parse(body);
  } catch (err) {
    throw ApiError.badRequest(firstZodIssueMessage(err));
  }

  const { showId, seatId } = data;

  const booking = await db.transaction(async (tx) => {
    // Lock the seat row so concurrent requests wait rather than double-booking
    const seatRows = await tx
      .select()
      .from(seats)
      .where(
        and(
          eq(seats.id, seatId),
          eq(seats.showId, showId),
          eq(seats.isBooked, false),
        ),
      )
      .for("update")
      .limit(1);

    if (seatRows.length === 0) {
      throw ApiError.conflict("Seat is already booked or does not exist");
    }

    // Mark seat as booked
    await tx.update(seats).set({ isBooked: true }).where(eq(seats.id, seatId));

    // Decrement available seats on the show
    await tx
      .update(shows)
      .set({ availableSeats: sql`${shows.availableSeats} - 1` })
      .where(and(eq(shows.id, showId), sql`${shows.availableSeats} > 0`));

    // Create the booking record
    const result = await tx
      .insert(bookings)
      .values({ userId, showId, seatId, status: "confirmed" })
      .returning();

    return result[0];
  });

  return booking;
}
