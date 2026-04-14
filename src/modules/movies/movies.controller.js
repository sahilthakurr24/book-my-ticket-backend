import ApiResponse from "../../common/utils/api-response.js";
import { createMovie, listMovies } from "./movies.service.js";

export async function createMovieController(req, res, next) {
  try {
    const data = await createMovie(req.body);
    return ApiResponse.created(res, "Movie created", data);
  } catch (err) {
    next(err);
  }
}

export async function listMoviesController(req, res, next) {
  try {
    const data = await listMovies();
    return ApiResponse.ok(res, "Movies fetched", data);
  } catch (err) {
    next(err);
  }
}
