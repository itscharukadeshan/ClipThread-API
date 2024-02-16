// auth.routes.ts

import { Router } from "express";
import { getAuthUrl } from "../../services/twitch/twitchAuth.service";
import { TwitchScope } from "./types";

const router = Router();

router.get("/login", (req, res) => {
  const scopeParam = req.query.scope;

  let scope: TwitchScope = "user";

  if (scopeParam) {
    if (
      typeof scopeParam === "string" &&
      (scopeParam === "user" ||
        scopeParam === "moderator" ||
        scopeParam === "creator")
    ) {
      scope = scopeParam as TwitchScope;
    }
  }

  const url = getAuthUrl(scope);
  res.redirect(url);
});

export default router;
