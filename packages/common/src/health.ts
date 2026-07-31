import { Request, Response } from "express";

export const createHealthHandler = (serviceName: string) => {
  return (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: serviceName,
      timestamp: new Date().toISOString(),
    });
  };
};
