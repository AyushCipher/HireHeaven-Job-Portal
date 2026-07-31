import express from "express";
import dotenv from "dotenv";
import routes from "./routes.js";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import { startSendMailConsumer } from "./consumer.js";
import { rateLimiter } from "./utils/redisClient.js";
import {
  createHealthHandler,
  createLogger,
  createMetrics,
  createRequestLogger,
} from "@hireheaven/common";

dotenv.config();

startSendMailConsumer();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const SERVICE_NAME = "utils-service";

const logger = createLogger(SERVICE_NAME);
const { metricsMiddleware, metricsHandler } = createMetrics(SERVICE_NAME);

const app = express();
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(createRequestLogger(logger));
app.use(metricsMiddleware);

app.use(
  rateLimiter({ windowSeconds: 60, maxRequests: 60, prefix: "utils-global" })
);

app.get("/health", createHealthHandler(SERVICE_NAME));
app.get("/metrics", metricsHandler);

app.use("/api/utils", routes);

app.listen(process.env.PORT, () => {
  logger.info(
    `Utils Service is running on http://localhost:${process.env.PORT}`
  );
});
