import ApiResponse from "../../common/utils/api-response.js";
import { createShow, listShowsByMovie, listSeatsByShow } from "./shows.service.js";

export async function createShowController(req, res, next) {
  try {
    const data = await createShow(req.body);
    return ApiResponse.created(res, "Show created", data);
  } catch (err) {
    next(err);
  }
}

export async function listShowsByMovieController(req, res, next) {
  try {
    const data = await listShowsByMovie(req.params.movieId);
    return ApiResponse.ok(res, "Shows fetched", data);
  } catch (err) {
    next(err);
  }
}

export async function listSeatsByShowController(req, res, next) {
  try {
    const data = await listSeatsByShow(req.params.showId);
    return ApiResponse.ok(res, "Seats fetched", data);
  } catch (err) {
    next(err);
  }
}
