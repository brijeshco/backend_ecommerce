import express from "express";
import {
  enrollInCourse,
  verifyEnrollment,
  getUserEnrollments,
  updateProgress
} from "../controllers/enrollmentController.js";
import authUser from "../middleware/auth.js";

const enrollmentRouter = express.Router();

// All routes require authentication
enrollmentRouter.post("/enroll", authUser, enrollInCourse);
enrollmentRouter.post("/verify", authUser, verifyEnrollment);
enrollmentRouter.post("/user-enrollments", authUser, getUserEnrollments);
enrollmentRouter.post("/update-progress", authUser, updateProgress);

export default enrollmentRouter;