import { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN_SECRET } from "../config/config";
import { getUserById } from "../controllers/usersController";
import { User } from "@prisma/client";
import { TokenPayload } from "./interface/types";
import { verifyToken } from "../utils/authUtils";
import ApplicationError from "../errors/applicationError";

async function authHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader) {
      throw new ApplicationError("Missing access Token", 401);
    }

    const token: string = authHeader.split(" ")[1];

    const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
    const { userId, role } = decodedToken as TokenPayload;

    if (!userId || !role) {
      throw new ApplicationError("Invalid access token", 403);
    }

    const user: User | null = await getUserById(userId);

    if (!user) {
      throw new ApplicationError("Failed to find user", 403);
    }
    if (user.id !== userId) {
      throw new ApplicationError("FaInvalid user", 403);
    }

    next();
  } catch (error) {
    throw error;
  }
}

export default authHandler;
