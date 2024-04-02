import { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN_SECRET } from "../config/config";
import { getUserById } from "../controllers/usersController";
import { User } from "@prisma/client";
import { TokenPayload } from "./interface/types";
import { verifyToken } from "../utils/authUtils";

async function authHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader) {
      return res.json({ error: "Missing access Token" }).status(401);
    }

    const token: string = authHeader.split(" ")[1];

    const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      return res.json({ error: "expired access token" }).status(401);
    }

    const { userId, role } = decodedToken as TokenPayload;

    if (!userId || !role) {
      return res.json({ error: "Invalid access token" }).status(403);
    }

    const user: User | null = await getUserById(userId);

    if (!user) {
      return res.json({ error: "Failed to find user" }).status(403);
    }
    if (user.id !== userId) {
      return res.json({ error: "Invalid user" }).status(403);
    }

    next();
  } catch (error) {
    throw error;
  }
}

export default authHandler;
