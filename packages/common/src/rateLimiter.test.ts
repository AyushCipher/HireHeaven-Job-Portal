import { describe, expect, it, vi } from "vitest";
import { Request, Response } from "express";
import { createRateLimiter } from "./rateLimiter.js";
import { createFakeRedisClient } from "./testUtils/fakeRedis.js";

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.setHeader = vi.fn();
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

const createMockReq = (ip = "1.2.3.4"): Request => ({ ip }) as Request;

describe("createRateLimiter", () => {
  it("allows requests under the limit", async () => {
    const redis = createFakeRedisClient();
    const rateLimiter = createRateLimiter(redis);
    const limiter = rateLimiter({
      windowSeconds: 60,
      maxRequests: 3,
      prefix: "test",
    });

    const next = vi.fn();
    const res = createMockRes();

    await limiter(createMockReq(), res, next);
    await limiter(createMockReq(), res, next);
    await limiter(createMockReq(), res, next);

    expect(next).toHaveBeenCalledTimes(3);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("blocks requests once the limit is exceeded", async () => {
    const redis = createFakeRedisClient();
    const rateLimiter = createRateLimiter(redis);
    const limiter = rateLimiter({
      windowSeconds: 60,
      maxRequests: 2,
      prefix: "test",
    });

    const next = vi.fn();
    const res = createMockRes();

    await limiter(createMockReq(), res, next);
    await limiter(createMockReq(), res, next);
    await limiter(createMockReq(), res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it("tracks each client IP independently", async () => {
    const redis = createFakeRedisClient();
    const rateLimiter = createRateLimiter(redis);
    const limiter = rateLimiter({
      windowSeconds: 60,
      maxRequests: 1,
      prefix: "test",
    });

    const next = vi.fn();
    const res = createMockRes();

    await limiter(createMockReq("1.1.1.1"), res, next);
    await limiter(createMockReq("2.2.2.2"), res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("fails open when redis errors out", async () => {
    const redis = createFakeRedisClient();
    (redis as any).incr = vi.fn().mockRejectedValue(new Error("redis down"));
    const rateLimiter = createRateLimiter(redis);
    const limiter = rateLimiter({
      windowSeconds: 60,
      maxRequests: 1,
      prefix: "test",
    });

    const next = vi.fn();
    const res = createMockRes();

    await limiter(createMockReq(), res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});
