import { db } from "../../db/index.js";
import { shows } from "../../db/schema/shows.js";
import { seats } from "../../db/schema/seats.js";
import { movies } from "../../db/schema/movies.js";
import ApiError from "../../common/utils/api-error.js";
import { firstZodIssueMessage } from "../../common/utils/zod-error-message.js";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createShowSchema = z.object({
  movieId: z.string().uuid(),
  startTime: z.string().datetime(),
  totalSeats: z.number().int().positive().max(500),
});

export async function createShow(body) {
  let data;
  try {
    data = createShowSchema.parse(body);
  } catch (err) {
    throw ApiError.badRequest(firstZodIssueMessage(err));
  }

  // verify movie exists
  const movie = await db.select().from(movies).where(eq(movies.id, data.movieId));
  if (movie.length === 0) {
    throw ApiError.notFound("Movie not found");
  }

  const show = await db.insert(shows).values({
    movieId: data.movieId,
    startTime: new Date(data.startTime),
    totalSeats: data.totalSeats,
    availableSeats: data.totalSeats,
  }).returning();

  const createdShow = show[0];

  // auto-seed seats for this show
  const seatRows = Array.from({ length: data.totalSeats }, (_, i) => ({
    id: `${createdShow.id}-S${i + 1}`,
    showId: createdShow.id,
    seatNumber: `S${i + 1}`,
    isBooked: false,
  }));

  await db.insert(seats).values(seatRows);

  return createdShow;
}

export async function listShowsByMovie(movieId) {
  return db.select().from(shows).where(eq(shows.movieId, movieId));
}

export async function listSeatsByShow(showId) {
  return db.select().from(seats).where(eq(seats.showId, showId));
}
