import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { checkOut, paymentVerification } from "../controllers/payment.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

const paymentActionLimiter = rateLimiter({
  windowSeconds: 60,
  maxRequests: 10,
  prefix: "payment-action",
});

router.post("/checkout", isAuth, paymentActionLimiter, checkOut);
router.post("/verify", isAuth, paymentActionLimiter, paymentVerification);

export default router;
