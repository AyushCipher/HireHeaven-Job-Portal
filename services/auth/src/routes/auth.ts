import express from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../controllers/auth.js";
import uploadFile from "../middleware/multer.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

const authAttemptLimiter = rateLimiter({
  windowSeconds: 60 * 15,
  maxRequests: 10,
  prefix: "auth-attempt",
});

router.post("/register", uploadFile, registerUser);
router.post("/login", authAttemptLimiter, loginUser);
router.post("/forgot", authAttemptLimiter, forgotPassword);
router.post("/reset/:token", authAttemptLimiter, resetPassword);

export default router;
