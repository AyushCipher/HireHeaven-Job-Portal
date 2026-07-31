import { NextFunction, Request, Response } from "express";
import { Registry, Histogram, collectDefaultMetrics } from "prom-client";

export const createMetrics = (serviceName: string) => {
  const register = new Registry();

  register.setDefaultLabels({ service: serviceName });
  collectDefaultMetrics({ register });

  const httpRequestDuration = new Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    registers: [register],
  });

  const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const endTimer = httpRequestDuration.startTimer();

    res.on("finish", () => {
      endTimer({
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
      });
    });

    next();
  };

  const metricsHandler = async (_req: Request, res: Response) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  };

  return { register, metricsMiddleware, metricsHandler };
};
