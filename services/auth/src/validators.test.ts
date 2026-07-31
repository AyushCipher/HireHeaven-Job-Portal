import { describe, expect, it } from "vitest";
import {
  forgotSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetSchema,
} from "./validators.js";

describe("auth validators", () => {
  it("registerSchema accepts a valid jobseeker payload", () => {
    const result = registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "ADA@Example.com",
      password: "supersecret",
      phoneNumber: "9876543210",
      role: "jobseeker",
      bio: "Engineer",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ada@example.com");
    }
  });

  it("registerSchema rejects an unknown role", () => {
    const result = registerSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "supersecret",
      phoneNumber: "9876543210",
      role: "superadmin",
    });

    expect(result.success).toBe(false);
  });

  it("registerSchema rejects a short password", () => {
    const result = registerSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "123",
      phoneNumber: "9876543210",
      role: "recruiter",
    });

    expect(result.success).toBe(false);
  });

  it("loginSchema rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "whatever",
    });

    expect(result.success).toBe(false);
  });

  it("forgotSchema requires an email", () => {
    expect(forgotSchema.safeParse({}).success).toBe(false);
    expect(forgotSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });

  it("resetSchema enforces a minimum password length", () => {
    expect(resetSchema.safeParse({ password: "short" }).success).toBe(false);
    expect(resetSchema.safeParse({ password: "longenough" }).success).toBe(
      true
    );
  });

  it("refreshSchema and logoutSchema require a non-empty refreshToken", () => {
    expect(refreshSchema.safeParse({}).success).toBe(false);
    expect(refreshSchema.safeParse({ refreshToken: "abc" }).success).toBe(
      true
    );
    expect(logoutSchema.safeParse({ refreshToken: "" }).success).toBe(false);
  });
});
