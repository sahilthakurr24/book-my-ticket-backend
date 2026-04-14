import ApiResponse from "../../common/utils/api-response.js";
import { signin, signup, refreshToken, logout } from "./auth.service.js";

export async function signupController(req, res, next) {
  try {
    const data = await signup({ body: req.body, file: req.file });
    return ApiResponse.created(res, "User registered successfully", data);
  } catch (err) {
    next(err);
  }
}

export async function signinController(req, res, next) {
  try {
    const data = await signin(req.body);
    return ApiResponse.ok(res, "Signed in successfully", data);
  } catch (err) {
    next(err);
  }
}

export async function refreshTokenController(req, res, next) {
  try {
    const data = await refreshToken(req.body);
    return ApiResponse.ok(res, "Token refreshed", data);
  } catch (err) {
    next(err);
  }
}

export async function logoutController(req, res, next) {
  try {
    await logout(req.user.id);
    return ApiResponse.ok(res, "Logged out successfully");
  } catch (err) {
    next(err);
  }
}
