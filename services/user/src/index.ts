import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.js";
import cors from "cors";
import { rateLimiter } from "./utils/redisClient.js";
import {
  createHealthHandler,
  createLogger,
  createMetrics,
  createRequestLogger,
} from "@hireheaven/common";

dotenv.config();

const SERVICE_NAME = "user-service";

const logger = createLogger(SERVICE_NAME);
const { metricsMiddleware, metricsHandler } = createMetrics(SERVICE_NAME);

const app = express();
app.use(cors());
app.use(express.json());
app.use(createRequestLogger(logger));
app.use(metricsMiddleware);

app.use(
  rateLimiter({ windowSeconds: 60, maxRequests: 100, prefix: "user-global" })
);

app.get("/health", createHealthHandler(SERVICE_NAME));
app.get("/metrics", metricsHandler);

app.use("/api/user", userRoutes);

app.listen(process.env.PORT, () => {
  logger.info(`User service is running on http://localhost:${process.env.PORT}`);
});
