import express from "express";
import jobRoutes from "./routes/job.js";
import cors from "cors";
import { rateLimiter } from "./utils/redisClient.js";
import {
  createHealthHandler,
  createLogger,
  createMetrics,
  createRequestLogger,
} from "@hireheaven/common";

const SERVICE_NAME = "job-service";

export const logger = createLogger(SERVICE_NAME);
const { metricsMiddleware, metricsHandler } = createMetrics(SERVICE_NAME);

const app = express();

app.use(cors());

app.use(express.json());

app.use(createRequestLogger(logger));
app.use(metricsMiddleware);

app.use(
  rateLimiter({ windowSeconds: 60, maxRequests: 100, prefix: "job-global" })
);

app.get("/health", createHealthHandler(SERVICE_NAME));
app.get("/metrics", metricsHandler);

app.use("/api/job", jobRoutes);

export default app;
