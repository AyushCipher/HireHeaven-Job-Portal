import { z } from "zod";

export const uploadSchema = z.object({
  buffer: z.string().trim().min(1, "buffer is required"),
  // Callers pass the old file's public_id so it gets replaced/destroyed on
  // re-upload (profile pic, resume) - but that column is null in the
  // database for anyone who's never uploaded one before, and .optional()
  // alone only accepts undefined, not null. .nullish() accepts both, so a
  // first-time upload isn't rejected before it even reaches the handler.
  public_id: z.string().trim().nullish(),
});

export const careerSchema = z.object({
  skills: z.string().trim().min(1, "Skills are required"),
});

export const resumeAnalyserSchema = z.object({
  pdfBase64: z.string().trim().min(1, "PDF data is required"),
});
