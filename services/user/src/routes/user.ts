import express from "express";
import { isAuth } from "../middlewares/auth.js";
import {
  adminListUsers,
  addSkillToUser,
  applyForJob,
  deleteSkillFromUser,
  getAllaplications,
  getUserProfile,
  myProfile,
  updateProfilePic,
  updateResume,
  updateUserProfile,
} from "../controllers/user.js";
import uploadFile from "../middlewares/multer.js";
import { requireRole, validate } from "@hireheaven/common";
import {
  applyForJobSchema,
  paginationQuerySchema,
  skillSchema,
  updateProfileSchema,
} from "../validators.js";

const router = express.Router();

router.get("/me", isAuth, myProfile);
router.get(
  "/admin/users",
  isAuth,
  requireRole("admin"),
  validate(paginationQuerySchema, "query"),
  adminListUsers
);
router.get("/:userId", isAuth, getUserProfile);
router.put(
  "/update/profile",
  isAuth,
  validate(updateProfileSchema),
  updateUserProfile
);
router.put("/update/pic", isAuth, uploadFile, updateProfilePic);
router.put("/update/resume", isAuth, uploadFile, updateResume);
router.post("/skill/add", isAuth, validate(skillSchema), addSkillToUser);
router.put("/skill/delete", isAuth, validate(skillSchema), deleteSkillFromUser);
router.post(
  "/apply/job",
  isAuth,
  validate(applyForJobSchema),
  applyForJob
);
router.get(
  "/application/all",
  isAuth,
  validate(paginationQuerySchema, "query"),
  getAllaplications
);

export default router;
