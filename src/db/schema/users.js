import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums.js";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  avatar: text("avatar"),
  role: userRoleEnum("role").default("user"),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow(),
});
