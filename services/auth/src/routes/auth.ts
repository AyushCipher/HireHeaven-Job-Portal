import express from "express";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
} from "../controllers/auth.js";
import uploadFile from "../middleware/multer.js";
import { rateLimiter } from "../utils/redisClient.js";
import { validate } from "@hireheaven/common";
import {
  forgotSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetSchema,
} from "../validators.js";

const router = express.Router();

const authAttemptLimiter = rateLimiter({
  windowSeconds: 60 * 15,
  maxRequests: 10,
  prefix: "auth-attempt",
});

router.post(
  "/register",
  uploadFile,
  validate(registerSchema),
  registerUser
);
router.post("/login", authAttemptLimiter, validate(loginSchema), loginUser);
router.post(
  "/forgot",
  authAttemptLimiter,
  validate(forgotSchema),
  forgotPassword
);
router.post(
  "/reset/:token",
  authAttemptLimiter,
  validate(resetSchema),
  resetPassword
);
router.post("/refresh", validate(refreshSchema), refreshAccessToken);
router.post("/logout", validate(logoutSchema), logoutUser);

export default router;
