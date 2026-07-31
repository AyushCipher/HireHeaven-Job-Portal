import { describe, expect, it } from "vitest";
import {
  adminJobActiveSchema,
  createJobSchema,
  jobListQuerySchema,
  updateApplicationStatusSchema,
  updateJobSchema,
} from "./validators.js";

describe("job validators", () => {
  it("createJobSchema coerces numeric strings from form fields", () => {
    const result = createJobSchema.safeParse({
      title: "Backend Engineer",
      description: "Build APIs",
      salary: "150000",
      location: "Remote",
      role: "Engineer",
      job_type: "Full-time",
      work_location: "Remote",
      company_id: "5",
      openings: "2",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salary).toBe(150000);
      expect(result.data.company_id).toBe(5);
    }
  });

  it("createJobSchema rejects an invalid job_type", () => {
    const result = createJobSchema.safeParse({
      title: "x",
      description: "x",
      salary: 1,
      location: "x",
      role: "x",
      job_type: "Freelance",
      work_location: "Remote",
      company_id: 1,
      openings: 1,
    });

    expect(result.success).toBe(false);
  });

  it("updateJobSchema requires the full replacement payload", () => {
    const result = updateJobSchema.safeParse({ title: "New title" });
    expect(result.success).toBe(false);
  });

  it("jobListQuerySchema defaults page and limit", () => {
    const result = jobListQuerySchema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("jobListQuerySchema caps the limit at 100", () => {
    const result = jobListQuerySchema.safeParse({ limit: "500" });
    expect(result.success).toBe(false);
  });

  it("updateApplicationStatusSchema only allows known statuses", () => {
    expect(
      updateApplicationStatusSchema.safeParse({ status: "Hired" }).success
    ).toBe(true);
    expect(
      updateApplicationStatusSchema.safeParse({ status: "Ghosted" }).success
    ).toBe(false);
  });

  it("adminJobActiveSchema requires a boolean", () => {
    expect(adminJobActiveSchema.safeParse({ is_active: true }).success).toBe(
      true
    );
    expect(
      adminJobActiveSchema.safeParse({ is_active: "true" }).success
    ).toBe(false);
  });
});
