import { UserRole } from "@prisma/client";
import {
  AUTH_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../config/config";
import jwt from "jsonwebtoken";
import moment from "moment";

export function generateAccessToken(userId: string, role: UserRole) {
  return jwt.sign({ userId: userId, role: role }, ACCESS_TOKEN_SECRET, {
    expiresIn: AUTH_TOKEN_EXPIRATION,
  });
}

export function generateRefreshToken() {
  const issuedAt = moment().unix();
  const expirationTime = moment().add(30, "days").unix();

  const refreshToken = jwt.sign(
    { iat: issuedAt, exp: expirationTime },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    }
  );
  return refreshToken;
}
