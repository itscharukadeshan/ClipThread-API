import { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN_SECRET } from "../config/config";
import { getUserById } from "../controllers/usersController";
import { User } from "@prisma/client";
import { TokenPayload } from "./types";
import { verifyToken } from "../utils/authUtils";

async function authHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Missing access Token" });
    }

    const token: string = authHeader.split(" ")[1];

    const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
    const { userId, role } = decodedToken as TokenPayload;

    if (!userId || !role) {
      return res.status(403).json({ message: "Invalid access token" });
    }

    const user: User | null = await getUserById(userId);

    if (!user) {
      return res.status(403).json({ message: "Failed to find user" });
    }
    if (user.id !== userId) {
      return res.status(403).json({ message: "Invalid user" });
    }

    next();
  } catch (error: any) {
    if (error.message === "Token has expired") {
      return res.status(401).json({ message: "Token has expired" });
    } else {
      return res.status(403).json({ message: "Invalid token" });
    }
  }
}

export default authHandler;
