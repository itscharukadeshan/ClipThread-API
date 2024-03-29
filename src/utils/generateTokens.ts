import { UserRole } from "@prisma/client";
import {
  AUTH_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../config/config";
import jwt from "jsonwebtoken";

export function generateAccessToken(userId: string, role: UserRole) {
  return jwt.sign({ userId: userId, role: role }, ACCESS_TOKEN_SECRET, {
    expiresIn: AUTH_TOKEN_EXPIRATION,
  });
}

export function generateRefreshToken() {
  const refreshToken = jwt.sign({}, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });
  return refreshToken;
}
