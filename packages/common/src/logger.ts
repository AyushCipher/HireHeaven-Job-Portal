import pino from "pino";
import { NextFunction, Request, Response } from "express";

export const createLogger = (serviceName: string) =>
  pino({
    name: serviceName,
    level: process.env.LOG_LEVEL || "info",
  });

export type Logger = ReturnType<typeof createLogger>;

export const createRequestLogger = (logger: Logger) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on("finish", () => {
      logger.info(
        {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - start,
          ip: req.ip,
        },
        "request completed"
      );
    });

    next();
  };
};
