import { describe, expect, it } from "vitest";
import {
  applyForJobSchema,
  paginationQuerySchema,
  skillSchema,
  updateProfileSchema,
} from "./validators.js";

describe("user validators", () => {
  it("updateProfileSchema allows a partial update", () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
    expect(updateProfileSchema.safeParse({ name: "Grace" }).success).toBe(
      true
    );
  });

  it("skillSchema rejects an empty skill name", () => {
    expect(skillSchema.safeParse({ skillName: "  " }).success).toBe(false);
    expect(skillSchema.safeParse({ skillName: "TypeScript" }).success).toBe(
      true
    );
  });

  it("applyForJobSchema coerces job_id to a positive integer", () => {
    const result = applyForJobSchema.safeParse({ job_id: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.job_id).toBe(42);
    }

    expect(applyForJobSchema.safeParse({ job_id: "-1" }).success).toBe(false);
  });

  it("paginationQuerySchema defaults page and limit", () => {
    const result = paginationQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 1, limit: 20 });
    }
  });
});
