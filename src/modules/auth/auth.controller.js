import ApiResponse from "../../common/utils/api-response.js";
import { signin, signup, refreshToken, logout } from "./auth.service.js";

function getRefreshTokenCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export async function signupController(req, res, next) {
  try {
    const data = await signup({ body: req.body, file: req.file });
    res.cookie(
      "refreshToken",
      data.refreshToken,
      getRefreshTokenCookieOptions(),
    );

    return ApiResponse.created(res, "User registered successfully", {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      role: data.role,
      accessToken: data.accessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function signinController(req, res, next) {
  try {
    const data = await signin(req.body);
    res.cookie(
      "refreshToken",
      data.refreshToken,
      getRefreshTokenCookieOptions(),
    );

    return ApiResponse.ok(res, "Signed in successfully", {
      user: data.user,
      accessToken: data.accessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshTokenController(req, res, next) {
  try {
    const data = await refreshToken(req.cookies.refreshToken);
    return ApiResponse.ok(res, "Token refreshed", data);
  } catch (err) {
    next(err);
  }
}

export async function logoutController(req, res, next) {
  try {
    await logout(req.user.id);
    res.clearCookie("refreshToken", getRefreshTokenCookieOptions());
    return ApiResponse.ok(res, "Logged out successfully");
  } catch (err) {
    next(err);
  }
}
