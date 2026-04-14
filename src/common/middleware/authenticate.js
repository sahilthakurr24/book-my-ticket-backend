import jwt from "jsonwebtoken";
import ApiError from "../utils/api-error.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(ApiError.unauthorized("Access token required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch {
    return next(ApiError.unauthorized("Invalid or expired access token"));
  }
}
