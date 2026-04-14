import { db } from "../../db/index.js";
import { movies } from "../../db/schema/movies.js";
import ApiError from "../../common/utils/api-error.js";
import { firstZodIssueMessage } from "../../common/utils/zod-error-message.js";
import { z } from "zod";

const createMovieSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  duration: z.number().int().positive(),
  language: z.string().max(50).optional(),
  genre: z.string().max(100).optional(),
  releaseDate: z.string().datetime().optional(),
});

export async function createMovie(body) {
  let data;
  try {
    data = createMovieSchema.parse(body);
  } catch (err) {
    throw ApiError.badRequest(firstZodIssueMessage(err));
  }

  const result = await db.insert(movies).values({
    ...data,
    releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
  }).returning();

  return result[0];
}

export async function listMovies() {
  return db.select().from(movies);
}
