import { describe, expect, it } from "vitest";
import { resolveServiceMap } from "./serviceMap.js";

describe("resolveServiceMap", () => {
  it("falls back to local default ports when no env overrides are set", () => {
    expect(resolveServiceMap({})).toEqual({
      "/api/auth": "http://localhost:5000",
      "/api/utils": "http://localhost:5001",
      "/api/user": "http://localhost:5002",
      "/api/job": "http://localhost:5003",
      "/api/payment": "http://localhost:5004",
    });
  });

  it("prefers an explicit env override for a given service", () => {
    const map = resolveServiceMap({
      AUTH_SERVICE_URL: "https://auth.internal",
    });

    expect(map["/api/auth"]).toBe("https://auth.internal");
    expect(map["/api/job"]).toBe("http://localhost:5003");
  });
});
