import { NextFunction, Request } from "express";
const jwt = require("jsonwebtoken");
import { ACCESS_TOKEN_SECRET } from "../config/config";

export function authHandler(
  err: Error,
  req: Request,
  res: any,
  next: NextFunction
) {
  try {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Missing access Token !" });
    }

    const token: string = authHeader.split(" ")[1];

    const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
    const { userId, role } = decodedToken;

    console.log(userId, role);

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
