import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";
import {
  createHealthHandler,
  createLogger,
  createMetrics,
  createRateLimiter,
  createRedisClient,
  createRequestLogger,
} from "@hireheaven/common";
import { resolveServiceMap } from "./serviceMap.js";

dotenv.config();

const SERVICE_NAME = "gateway";

const logger = createLogger(SERVICE_NAME);
const { metricsMiddleware, metricsHandler } = createMetrics(SERVICE_NAME);

const redisClient = createRedisClient({
  url: process.env.Redis_url,
  label: "Gateway",
});
const rateLimiter = createRateLimiter(redisClient);

const app = express();

// No body-parsing middleware here on purpose: this app only proxies,
// and consuming the request stream up front would break streaming the
// original (JSON or multipart) body through to the target service.
app.use(cors());
app.use(createRequestLogger(logger));
app.use(metricsMiddleware);
app.use(
  rateLimiter({
    windowSeconds: 60,
    maxRequests: 300,
    prefix: "gateway-global",
  })
);

app.get("/health", createHealthHandler(SERVICE_NAME));
app.get("/metrics", metricsHandler);

const services = resolveServiceMap(process.env);

for (const [mountPath, target] of Object.entries(services)) {
  app.use(
    mountPath,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      // Express strips the mount path from req.url before handing off to
      // this middleware; add it back so the target service sees the same
      // full path it was written to handle (e.g. /api/auth/login).
      pathRewrite: (path) => `${mountPath}${path}`,
      on: {
        error: (err, _req, res) => {
          logger.error({ err, target }, "proxy request failed");
          if ("writeHead" in res) {
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Upstream service unavailable" }));
          }
        },
      },
    })
  );
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info(`Gateway is running on http://localhost:${PORT}`);
});
