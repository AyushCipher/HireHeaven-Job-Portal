import { describe, expect, it, vi } from "vitest";
import { Request, Response } from "express";
import { TryCatch } from "./tryCatch.js";
import ErrorHandler from "./errorHandler.js";

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe("TryCatch", () => {
  it("runs the wrapped controller when it resolves", async () => {
    const controller = vi.fn(async (_req, res) => {
      res.json({ ok: true });
    });

    const handler = TryCatch(controller as any);
    const res = createMockRes();

    await handler({} as Request, res, vi.fn());

    expect(controller).toHaveBeenCalledOnce();
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("responds with the ErrorHandler's status code and message", async () => {
    const controller = vi.fn(async () => {
      throw new ErrorHandler(409, "Conflict");
    });

    const handler = TryCatch(controller as any);
    const res = createMockRes();

    await handler({} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Conflict" });
  });

  it("falls back to a 500 for unexpected errors", async () => {
    const controller = vi.fn(async () => {
      throw new Error("kaboom");
    });

    const handler = TryCatch(controller as any);
    const res = createMockRes();

    await handler({} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "kaboom" });
  });
});
