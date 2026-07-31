import express from "express";
import authRoutes from "./routes/auth.js";
import { connectKafka } from "./producer.js";
import cors from "cors";
import { rateLimiter } from "./utils/redisClient.js";
import {
  createHealthHandler,
  createLogger,
  createMetrics,
  createRequestLogger,
} from "@hireheaven/common";

const SERVICE_NAME = "auth-service";

export const logger = createLogger(SERVICE_NAME);
const { metricsMiddleware, metricsHandler } = createMetrics(SERVICE_NAME);

const app = express();
app.use(cors());
app.use(express.json());
app.use(createRequestLogger(logger));
app.use(metricsMiddleware);

app.use(
  rateLimiter({ windowSeconds: 60, maxRequests: 100, prefix: "auth-global" })
);

connectKafka();

app.get("/health", createHealthHandler(SERVICE_NAME));
app.get("/metrics", metricsHandler);

app.use("/api/auth", authRoutes);

export default app;
