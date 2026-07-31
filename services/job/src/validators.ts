import { z } from "zod";

const jobTypeEnum = z.enum([
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
]);
const workLocationEnum = z.enum(["On-site", "Remote", "Hybrid"]);
const applicationStatusEnum = z.enum(["Submitted", "Rejected", "Hired"]);

export const createCompanySchema = z.object({
  name: z.string().trim().min(1, "Company name is required"),
  description: z.string().trim().min(1, "Description is required"),
  website: z.string().trim().url("Invalid website URL"),
});

export const createJobSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  salary: z.coerce.number().positive("Salary must be a positive number"),
  location: z.string().trim().min(1, "Location is required"),
  role: z.string().trim().min(1, "Role is required"),
  job_type: jobTypeEnum,
  work_location: workLocationEnum,
  company_id: z.coerce.number().int().positive(),
  openings: z.coerce.number().positive("Openings must be a positive number"),
});

export const updateJobSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  salary: z.coerce.number().positive("Salary must be a positive number"),
  location: z.string().trim().min(1, "Location is required"),
  role: z.string().trim().min(1, "Role is required"),
  job_type: jobTypeEnum,
  work_location: workLocationEnum,
  openings: z.coerce.number().positive("Openings must be a positive number"),
  is_active: z.boolean().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: applicationStatusEnum,
});

export const jobListQuerySchema = z.object({
  title: z.string().trim().optional(),
  location: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const applicationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const adminJobActiveSchema = z.object({
  is_active: z.boolean(),
});
