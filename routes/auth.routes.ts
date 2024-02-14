/** @format */

// routes/auth.routes.js

import { Router } from "express";
import passport = require("passport");

const router = Router();

// Login route
router.get("/twitch", passport.authenticate("twitch"));

router.get(
  "/twitch/callback",
  passport.authenticate("twitch", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication

    res.redirect("/dashboard");
  }
);

// Google login route
router.get("/youtube", passport.authenticate("youtube"));

router.get(
  "/youtube/callback",
  passport.authenticate("youtube", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication

    res.redirect("/dashboard");
  }
);

export default router;
