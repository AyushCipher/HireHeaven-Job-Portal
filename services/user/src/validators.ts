import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phoneNumber: z.string().trim().min(7).optional(),
  bio: z.string().trim().optional(),
});

export const skillSchema = z.object({
  skillName: z.string().trim().min(1, "Please provide a skill name"),
});

export const applyForJobSchema = z.object({
  job_id: z.coerce.number().int().positive(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
