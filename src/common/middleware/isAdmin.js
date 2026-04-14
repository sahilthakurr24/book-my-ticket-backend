import ApiError from "../utils/api-error.js";

export function isAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return next(ApiError.forbidden("Admin access required"));
  }
  next();
}
