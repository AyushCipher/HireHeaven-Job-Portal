import express from "express";
import { isAuth } from "../middlewares/auth.js";
import uploadFile from "../middlewares/multer.js";
import { requireRole, validate } from "@hireheaven/common";
import {
  adminJobActiveSchema,
  applicationsQuerySchema,
  createCompanySchema,
  createJobSchema,
  jobListQuerySchema,
  updateApplicationStatusSchema,
  updateJobSchema,
} from "../validators.js";
import {
  adminListAllCompanies,
  adminListAllJobs,
  adminSetJobActive,
  createCompany,
  createJob,
  deleteCompany,
  getAllActiveJobs,
  getAllApplicationForJob,
  getAllCompany,
  getCompanyDetails,
  getSingleJob,
  updateApplication,
  updateJob,
} from "../controllers/job.js";

const router = express.Router();

// Admin moderation routes are declared before the "/:jobId" catch-all below
// so "admin" in the path isn't swallowed as a job id.
router.get(
  "/admin/jobs",
  isAuth,
  requireRole("admin"),
  validate(applicationsQuerySchema, "query"),
  adminListAllJobs
);
router.put(
  "/admin/jobs/:jobId/active",
  isAuth,
  requireRole("admin"),
  validate(adminJobActiveSchema),
  adminSetJobActive
);
router.get(
  "/admin/companies",
  isAuth,
  requireRole("admin"),
  validate(applicationsQuerySchema, "query"),
  adminListAllCompanies
);

router.post(
  "/company/new",
  isAuth,
  uploadFile,
  validate(createCompanySchema),
  createCompany
);
router.delete("/company/:companyId", isAuth, deleteCompany);
router.post("/new", isAuth, validate(createJobSchema), createJob);
router.put("/:jobId", isAuth, validate(updateJobSchema), updateJob);
router.get("/company/all", isAuth, getAllCompany);
router.get("/company/:id", getCompanyDetails);
router.get("/all", validate(jobListQuerySchema, "query"), getAllActiveJobs);
router.get("/:jobId", getSingleJob);
router.get(
  "/application/:jobId",
  isAuth,
  validate(applicationsQuerySchema, "query"),
  getAllApplicationForJob
);
router.put(
  "/application/update/:id",
  isAuth,
  validate(updateApplicationStatusSchema),
  updateApplication
);

export default router;
