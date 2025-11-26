import express from "express";
import {
  listCourses,
  getCourse,
  addCourse,
  updateCourse,
  removeCourse,
  getFeaturedCourses,
  getCoursesByCategory
} from "../controllers/courseController.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";

const courseRouter = express.Router();

// Public routes
courseRouter.get("/list", listCourses);
courseRouter.get("/featured", getFeaturedCourses);
courseRouter.get("/category/:category", getCoursesByCategory);
courseRouter.get("/:courseId", getCourse);

// Admin routes
courseRouter.post("/add", adminAuth, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'thumbnail0', maxCount: 1 },
  { name: 'thumbnail1', maxCount: 1 },
  { name: 'thumbnail2', maxCount: 1 }
]), addCourse);
courseRouter.put("/update/:id", adminAuth, upload.fields([
  { name: 'thumbnail0', maxCount: 1 },
  { name: 'thumbnail1', maxCount: 1 },
  { name: 'thumbnail2', maxCount: 1 }
]), updateCourse);
courseRouter.post("/remove", adminAuth, removeCourse);

export default courseRouter;