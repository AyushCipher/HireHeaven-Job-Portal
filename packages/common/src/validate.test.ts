import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { Request, Response } from "express";
import { validate } from "./validate.js";

const createMockRes = () => {
  const res: Partial<Response> = { locals: {} };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe("validate", () => {
  const schema = z.object({ email: z.string().email() });

  it("calls next() and copies parsed data back onto req.body", () => {
    const req = { body: { email: "user@example.com" } } as Request;
    const res = createMockRes();
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({ email: "user@example.com" });
    expect(res.locals.validated.body).toEqual({ email: "user@example.com" });
  });

  it("responds 400 with field errors on invalid input", () => {
    const req = { body: { email: "not-an-email" } } as Request;
    const res = createMockRes();
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Validation failed" })
    );
  });

  it("does not write back to req.query (Express 5 getter-only)", () => {
    const req = { query: { email: "user@example.com" } } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn();

    validate(schema, "query")(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.locals.validated.query).toEqual({ email: "user@example.com" });
  });
});
