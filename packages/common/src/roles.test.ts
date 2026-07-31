import { describe, expect, it, vi } from "vitest";
import { Response } from "express";
import { requireRole } from "./roles.js";

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe("requireRole", () => {
  it("calls next() when req.user has an allowed role", () => {
    const req = { user: { role: "admin" } } as any;
    const res = createMockRes();
    const next = vi.fn();

    requireRole("admin")(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("responds 403 when req.user is missing", () => {
    const req = {} as any;
    const res = createMockRes();
    const next = vi.fn();

    requireRole("admin")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("responds 403 when the role isn't in the allowed list", () => {
    const req = { user: { role: "jobseeker" } } as any;
    const res = createMockRes();
    const next = vi.fn();

    requireRole("admin", "recruiter")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
