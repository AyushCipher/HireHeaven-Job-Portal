import express from "express";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import cors from "cors";
import paymentRoutes from "./routes/payment.js";
import { rateLimiter } from "./utils/redisClient.js";
import {
  createHealthHandler,
  createLogger,
  createMetrics,
  createRequestLogger,
} from "@hireheaven/common";

dotenv.config();

export const instance = new Razorpay({
  key_id: process.env.Razorpay_Key,
  key_secret: process.env.Razorpay_Secret,
});

const SERVICE_NAME = "payment-service";

const logger = createLogger(SERVICE_NAME);
const { metricsMiddleware, metricsHandler } = createMetrics(SERVICE_NAME);

const app = express();

app.use(cors());
app.use(express.json());
app.use(createRequestLogger(logger));
app.use(metricsMiddleware);
app.use(
  rateLimiter({ windowSeconds: 60, maxRequests: 60, prefix: "payment-global" })
);

app.get("/health", createHealthHandler(SERVICE_NAME));
app.get("/metrics", metricsHandler);

app.use("/api/payment", paymentRoutes);

app.listen(process.env.PORT, () => {
  logger.info(`Payment Service is running on ${process.env.PORT}`);
});
