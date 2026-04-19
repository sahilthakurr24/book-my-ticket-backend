import ApiError from "../../common/utils/api-error.js";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  signinSchemaValidation,
  signupSchemaValidation,
} from "./auth.validation.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../common/utils/jwt.js";
import { firstZodIssueMessage } from "../../common/utils/zod-error-message.js";
import { eq } from "drizzle-orm";
import {
  deleteImageFromImageKit,
  uploadImageToImageKit,
} from "../../common/services/imagekit.service.js";

export async function signin(body) {
  //validation

  let validatedData;
  try {
    validatedData = await signinSchemaValidation.parseAsync(body);
  } catch (error) {
    throw ApiError.badRequest(firstZodIssueMessage(error));
  }

  // check user
  const exists = await db
    .select()
    .from(users)
    .where(eq(users.email, validatedData.email));

  if (exists.length === 0) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const existingUser = exists[0];

  // check password
  const isPasswordCorrect = await bcrypt.compare(
    validatedData.password,
    existingUser.password,
  );

  if (!isPasswordCorrect) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  // generate tokens
  const accessToken = generateAccessToken(existingUser);
  const refreshToken = generateRefreshToken(existingUser);

  // store refresh token
  await db
    .update(users)
    .set({ refreshToken })
    .where(eq(users.id, existingUser.id));

  return {
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      avatar: existingUser.avatar,
      role: existingUser.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function signup({ body, file }) {
  //validation
  let validatedData;

  try {
    validatedData = await signupSchemaValidation.parseAsync({
      ...body,
      avatar: file,
    });
  } catch (error) {
    throw ApiError.badRequest(firstZodIssueMessage(error));
  }

  //check if user already exist
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, validatedData.email));

  if (existingUser.length > 0) {
    throw ApiError.conflict("User already exist");
  }
  // hash password
  const hashedPassowrd = await bcrypt.hash(validatedData.password, 10);

  let uploadResponse = null;

  try {
    uploadResponse = await uploadImageToImageKit(validatedData.avatar, "/user-avatars");

    const { createdUser, refreshToken } = await db.transaction(async (tx) => {
      const user = await tx
        .insert(users)
        .values({
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassowrd,
          avatar: uploadResponse?.url ?? null,
        })
        .returning();

      const insertedUser = user[0];
      const refreshToken = generateRefreshToken(insertedUser);

      await tx
        .update(users)
        .set({ refreshToken })
        .where(eq(users.id, insertedUser.id));

      return {
        createdUser: insertedUser,
        refreshToken,
      };
    });

    //creating token
    const accessToken = generateAccessToken(createdUser);

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      avatar: createdUser.avatar,
      role: createdUser.role,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    if (uploadResponse?.fileId) {
      await deleteImageFromImageKit(uploadResponse.fileId).catch(() => {});
    }

    throw error;
  }
}

export async function refreshToken(token) {
  if (!token) {
    throw ApiError.badRequest("Refresh token is required");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const result = await db.select().from(users).where(eq(users.id, decoded.id));
  if (result.length === 0) {
    throw ApiError.unauthorized("User not found");
  }

  const user = result[0];
  if (user.refreshToken !== token) {
    throw ApiError.unauthorized("Refresh token mismatch");
  }

  const accessToken = generateAccessToken(user);
  return { accessToken };
}

export async function logout(userId) {
  await db
    .update(users)
    .set({ refreshToken: null })
    .where(eq(users.id, userId));
}
