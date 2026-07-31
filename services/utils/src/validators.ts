import { z } from "zod";

export const uploadSchema = z.object({
  buffer: z.string().trim().min(1, "buffer is required"),
  public_id: z.string().trim().optional(),
});

export const careerSchema = z.object({
  skills: z.string().trim().min(1, "Skills are required"),
});

export const resumeAnalyserSchema = z.object({
  pdfBase64: z.string().trim().min(1, "PDF data is required"),
});
