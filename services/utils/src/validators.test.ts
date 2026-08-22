import { describe, expect, it } from "vitest";
import { careerSchema, resumeAnalyserSchema, uploadSchema } from "./validators.js";

describe("utils validators", () => {
  it("uploadSchema requires a non-empty buffer", () => {
    expect(uploadSchema.safeParse({ buffer: "" }).success).toBe(false);
    expect(uploadSchema.safeParse({ buffer: "data:..." }).success).toBe(true);
  });

  it("uploadSchema treats public_id as optional", () => {
    const result = uploadSchema.safeParse({ buffer: "data:..." });
    expect(result.success).toBe(true);
  });

  it("uploadSchema accepts a null public_id (a user's first upload, no prior file to replace)", () => {
    expect(
      uploadSchema.safeParse({ buffer: "data:...", public_id: null }).success
    ).toBe(true);
  });

  it("careerSchema requires a non-empty skills array", () => {
    expect(careerSchema.safeParse({ skills: [] }).success).toBe(false);
    expect(careerSchema.safeParse({ skills: "React, Node" }).success).toBe(
      false
    );
    expect(
      careerSchema.safeParse({ skills: ["React", "Node"] }).success
    ).toBe(true);
  });

  it("resumeAnalyserSchema requires pdfBase64", () => {
    expect(resumeAnalyserSchema.safeParse({}).success).toBe(false);
    expect(
      resumeAnalyserSchema.safeParse({ pdfBase64: "JVBERi0x" }).success
    ).toBe(true);
  });
});
