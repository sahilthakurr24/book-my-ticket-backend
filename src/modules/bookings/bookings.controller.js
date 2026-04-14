import ApiResponse from "../../common/utils/api-response.js";
import { createBooking } from "./bookings.service.js";

export async function createBookingController(req, res, next) {
  try {
    const data = await createBooking({ userId: req.user.id, body: req.body });
    return ApiResponse.created(res, "Booking confirmed", data);
  } catch (err) {
    next(err);
  }
}
