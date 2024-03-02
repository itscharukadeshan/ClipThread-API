import { NextFunction, Request } from "express";

const jwt = require("jsonwebtoken");
import { ACCESS_TOKEN_SECRET } from "../config/config";
import { getUser } from "../controllers/usersController";
import { User } from "@prisma/client";

async function authHandler(
  err: Error,
  req: Request,
  res: any,
  next: NextFunction
) {
  try {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Missing access Token" });
    }

    const token: string = authHeader.split(" ")[1];

    const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
    const { payload: userId, role } = decodedToken;

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

    console.log({ userId, role });

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

module.exports = authHandler;
