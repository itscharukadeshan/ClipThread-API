import { UserRole } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { ACCESS_TOKEN_SECRET } from "../config/config";
import { TokenPayload } from "./interface/types";
import { verifyToken } from "../utils/authUtils";
import ApplicationError from "../errors/applicationError";

const roleHandler = (permission?: UserRole, secondPermission?: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader) {
      throw new ApplicationError("Missing access Token", 401);
    }
    const accessToken: string = authHeader.split(" ")[1];

    try {
      const decodedToken = verifyToken(accessToken, ACCESS_TOKEN_SECRET);
      const { userId, role } = decodedToken as TokenPayload;
      const userRole = role;

      if (!role || userRole === permission || userRole === secondPermission) {
        next();
      } else {
        throw new ApplicationError(
          "Forbidden : need elevated permission to do this task",
          403
        );
      }
    } catch (error) {
      throw error;
    }
  };
};

export default roleHandler;
