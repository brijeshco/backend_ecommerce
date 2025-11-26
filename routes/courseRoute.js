import express from "express";
import {
  listCourses,
  getCourse,
  addCourse,
  updateCourse,
  removeCourse,
  getFeaturedCourses,
  getCoursesByCategory,
  getAllReviews,
  addReview,
  deleteReview
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
  { name: 'thumbnail2', maxCount: 1 },
  { name: 'thumbnail3', maxCount: 1 },
  { name: 'thumbnail4', maxCount: 1 },
  { name: 'thumbnail5', maxCount: 1 },
  { name: 'thumbnail6', maxCount: 1 },
  { name: 'thumbnail7', maxCount: 1 },
  { name: 'thumbnail8', maxCount: 1 },
  { name: 'thumbnail9', maxCount: 1 }
]), addCourse);
courseRouter.put("/update/:id", adminAuth, upload.fields([
  { name: 'thumbnail0', maxCount: 1 },
  { name: 'thumbnail1', maxCount: 1 },
  { name: 'thumbnail2', maxCount: 1 },
  { name: 'thumbnail3', maxCount: 1 },
  { name: 'thumbnail4', maxCount: 1 },
  { name: 'thumbnail5', maxCount: 1 },
  { name: 'thumbnail6', maxCount: 1 },
  { name: 'thumbnail7', maxCount: 1 },
  { name: 'thumbnail8', maxCount: 1 },
  { name: 'thumbnail9', maxCount: 1 }
]), updateCourse);
courseRouter.post("/remove", adminAuth, removeCourse);

// Review management routes (Admin only)
courseRouter.get("/reviews/all", adminAuth, getAllReviews);
courseRouter.post("/reviews/add", adminAuth, addReview);
courseRouter.delete("/reviews/:reviewId", adminAuth, deleteReview);

export default courseRouter;