import { UserRole } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { ACCESS_TOKEN_SECRET } from "../config/config";
import { TokenPayload } from "./interface/types";
import { verifyToken } from "../utils/authUtils";

const roleHandler = (permission?: UserRole, secondPermission?: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Missing access Token" });
    }
    const accessToken: string = authHeader.split(" ")[1];

    try {
      const decodedToken = verifyToken(accessToken, ACCESS_TOKEN_SECRET);
      const { userId, role } = decodedToken as TokenPayload;
      const userRole = role;

      if (!role || userRole === permission || userRole === secondPermission) {
        next();
      } else {
        res.status(403).json({
          message: `Forbidden : need elevated permission to do this task.`,
        });
      }
    } catch (error) {
      res.status(401).json({ message: "Invalid access token" });
    }
  };
};

export default roleHandler;
