import { NextFunction, Request } from "express";

const jwt = require("jsonwebtoken");
import { ACCESS_TOKEN_SECRET } from "../config/config";
import { getUser } from "../controllers/usersController";
import { User } from "@prisma/client";

export async function authHandler(
  err: Error,
  req: Request & { requiredRole?: string },
  res: any,
  next: NextFunction
) {
  try {
    const authHeader: string | undefined = req.headers.authorization;
    const requiredRole: string | undefined = req.requiredRole;

    if (!authHeader) {
      return res.status(401).json({ message: "Missing access Token" });
    }

    const token: string = authHeader.split(" ")[1];

    const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
    const { userId, role } = decodedToken;

    if (!userId || !role) {
      return res.status(403).json({ message: "Invalid access token" });
    }

    const user: User = await getUser(userId);

    if (!user) {
      return res.status(403).json({ message: "Failed to find user" });
    }
    if (user.id !== userId) {
      return res.status(403).json({ message: "Invalid user" });
    }

    if (user.login !== requiredRole) {
      return res.status(403).json({ message: "You don't have access " });
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

function verifyToken(token: string, secretKey: string) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    return null;
  }
}
