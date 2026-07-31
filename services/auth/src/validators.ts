import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().trim().min(7, "Invalid phone number"),
  role: z.enum(["jobseeker", "recruiter"]),
  bio: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
});

export const resetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});
