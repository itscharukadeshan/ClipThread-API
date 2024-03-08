import cron from "node-cron";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { REFRESH_TOKEN_SECRET } from "../src/config/config";

const prisma = new PrismaClient();

cron.schedule("0 * * * *", async () => {
  try {
    const allTokens = await prisma.revokedTokens.findMany();

    for (const token of allTokens) {
      try {
        const decodedToken = jwt.verify(token.id, REFRESH_TOKEN_SECRET);

        await prisma.revokedTokens.update({
          where: { id: token.id },
          data: { expired: false },
        });
      } catch (error) {
        await prisma.revokedTokens.update({
          where: { id: token.id },
          data: { expired: true },
        });
      }
    }

    console.log("Token expiration status updated.");
  } catch (error) {
    console.error("Error updating token expiration status:", error);
  }
});
