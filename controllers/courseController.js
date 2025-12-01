import courseModel from "../models/courseModel.js";
import enrollmentModel from "../models/enrollmentModel.js";
import reviewModel from "../models/reviewModel.js";
import { v2 as cloudinary } from "cloudinary";

// Get all courses with filters
const listCourses = async (req, res) => {
  try {
    const { category, level, search, featured, limit } = req.query;
    
    let filter = { isActive: true };
    
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (featured === 'true') filter.isFeatured = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let query = courseModel.find(filter).sort({ createdAt: -1 });
    
    if (limit) query = query.limit(parseInt(limit));
    
    const courses = await query;
    res.json({ success: true, courses });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get single course by ID
const getCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await courseModel.findById(courseId);
    
    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    // Debug: Log course images
    console.log("Course ID:", courseId);
    console.log("Course images from DB:", course.images);
    console.log("Course thumbnail from DB:", course.thumbnail);

    // Get reviews for this course - handle both user reviews and admin-added reviews
    const reviews = await reviewModel.find({ courseId }).populate('userId', 'name avatar email');
    
    // Format reviews to handle admin-added reviews
    const formattedReviews = reviews.map(review => ({
      ...review.toObject(),
      userId: review.userId || {
        name: review.reviewerName,
        email: review.reviewerEmail,
        avatar: null
      }
    }));
    
    res.json({ success: true, course, reviews: formattedReviews });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add new course (Admin only)
const addCourse = async (req, res) => {
  try {
    console.log("=== ADD COURSE DEBUG ===");
    console.log("Request body:", req.body);
    console.log("About field received:", req.body.about);
    console.log("About field type:", typeof req.body.about);
    console.log("About field length:", req.body.about ? req.body.about.length : 0);

    const {
      title,
      description,
      about,
      shortDescription,
      price,
      originalPrice,
      category,
      level,
      duration,
      lessons,
      instructor,
      features,
      requirements,
      whatYouWillLearn,
      tags,
      isFeatured,
      isPopular,
      keywords,
      curriculum,
      thumbnailCount
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category || !level || !duration || !instructor) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Handle multiple thumbnail uploads - use the first one as main thumbnail
    let thumbnail = null;
    
    // Check for new thumbnail format (thumbnail0, thumbnail1, etc.)
    if (thumbnailCount && parseInt(thumbnailCount) > 0) {
      thumbnail = req.files.thumbnail0 && req.files.thumbnail0[0];
    }
    
    // Fallback to old format
    if (!thumbnail) {
      thumbnail = req.files.thumbnail && req.files.thumbnail[0];
    }

    if (!thumbnail) {
      return res.json({ success: false, message: "Thumbnail is required" });
    }

    console.log("Uploading images to Cloudinary...");
    
    // Upload main thumbnail
    const thumbnailResult = await cloudinary.uploader.upload(thumbnail.path, {
      resource_type: "image"
    });
    console.log("Thumbnail uploaded successfully:", thumbnailResult.secure_url);

    // Upload additional images if any
    let additionalImages = [];
    if (thumbnailCount && parseInt(thumbnailCount) > 1) {
      for (let i = 1; i < parseInt(thumbnailCount); i++) {
        const additionalImage = req.files[`thumbnail${i}`] && req.files[`thumbnail${i}`][0];
        if (additionalImage) {
          console.log(`Uploading additional image ${i}:`, additionalImage.originalname);
          const imageResult = await cloudinary.uploader.upload(additionalImage.path, {
            resource_type: "image"
          });
          additionalImages.push(imageResult.secure_url);
          console.log(`Additional image ${i} uploaded successfully:`, imageResult.secure_url);
        }
      }
    }

    // Parse JSON fields safely
    let parsedInstructor, parsedFeatures, parsedRequirements, parsedWhatYouWillLearn, parsedTags, parsedCurriculum;
    
    try {
      parsedInstructor = JSON.parse(instructor);
      parsedFeatures = JSON.parse(features);
      parsedRequirements = JSON.parse(requirements);
      parsedWhatYouWillLearn = JSON.parse(whatYouWillLearn);
      parsedTags = JSON.parse(tags);
      parsedCurriculum = curriculum ? JSON.parse(curriculum) : [];
    } catch (parseError) {
      console.log("JSON Parse Error:", parseError);
      return res.json({ success: false, message: "Invalid JSON data in request" });
    }

    const courseData = {
      title,
      description,
      about: about || "",
      shortDescription,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      thumbnail: thumbnailResult.secure_url,
      images: [thumbnailResult.secure_url, ...additionalImages], // Include all images
      category,
      level,
      duration,
      lessons: lessons ? JSON.parse(lessons) : [],
      instructor: parsedInstructor,
      features: parsedFeatures,
      requirements: parsedRequirements,
      whatYouWillLearn: parsedWhatYouWillLearn,
      tags: parsedTags,
      keywords: keywords || "",
      curriculum: parsedCurriculum,
      isFeatured: isFeatured === 'true',
      isPopular: isPopular === 'true'
    };

    console.log("Creating course with data:", courseData);
    console.log("About field being saved:", courseData.about);
    console.log("Images array being saved:", courseData.images);
    console.log("Number of images:", courseData.images.length);
    const course = new courseModel(courseData);
    await course.save();
    console.log("Course saved successfully");
    console.log("Saved course about field:", course.about);
    console.log("Saved course images:", course.images);

    res.json({ success: true, message: "Course added successfully" });
  } catch (error) {
    console.error("Add Course Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update course (Admin only)
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("🚀 UPDATE COURSE FUNCTION CALLED!");
    console.log("=== UPDATE COURSE DEBUG ===");
    console.log("Course ID:", id);
    console.log("About field received:", req.body.about);
    console.log("About field type:", typeof req.body.about);
    console.log("About field length:", req.body.about ? req.body.about.length : 0);
    console.log("Full request body keys:", Object.keys(req.body));
    
    const {
      title,
      description,
      about,
      shortDescription,
      price,
      originalPrice,
      category,
      level,
      duration,
      lessons,
      instructor,
      features,
      requirements,
      whatYouWillLearn,
      tags,
      isFeatured,
      isPopular,
      keywords,
      curriculum,
      thumbnailCount
    } = req.body;

    // Find existing course
    const existingCourse = await courseModel.findById(id);
    if (!existingCourse) {
      return res.json({ success: false, message: "Course not found" });
    }

    let thumbnailUrl = existingCourse.thumbnail;
    let imagesArray = existingCourse.images || [existingCourse.thumbnail];

    // Handle new images upload if provided
    console.log("Thumbnail count received:", thumbnailCount);
    console.log("Files received:", req.files ? Object.keys(req.files) : "No files");
    console.log("Existing images before update:", imagesArray);
    
    // Only process new images if thumbnailCount is provided and files are uploaded
    if (thumbnailCount && parseInt(thumbnailCount) > 0) {
      const newImages = [];
      
      for (let i = 0; i < parseInt(thumbnailCount); i++) {
        const image = req.files[`thumbnail${i}`] && req.files[`thumbnail${i}`][0];
        if (image) {
          console.log(`Uploading new image ${i}:`, image.originalname);
          // Upload new image to cloudinary
          const imageResult = await cloudinary.uploader.upload(image.path, {
            resource_type: "image"
          });
          newImages.push(imageResult.secure_url);
          console.log(`New image ${i} uploaded successfully:`, imageResult.secure_url);
        }
      }
      
      if (newImages.length > 0) {
        thumbnailUrl = newImages[0]; // First image becomes the main thumbnail
        imagesArray = newImages; // Replace all images with new ones
        console.log("Replaced with new images array:", imagesArray);
      } else {
        console.log("No valid new images found, keeping existing images");
      }
    } else {
      console.log("No thumbnailCount provided, preserving existing images:", imagesArray);
    }

    // Rebuild the about field handling completely
    let aboutContent = existingCourse.about || ""; // Default to existing value
    
    console.log("Raw about field from request:", about);
    console.log("Type of about field:", typeof about);
    
    if (about !== undefined && about !== null) {
      if (typeof about === 'string' && about.trim() !== '') {
        aboutContent = about.trim();
        console.log("About content processed successfully:", aboutContent);
      } else {
        console.log("About field is empty string, keeping existing:", existingCourse.about);
        aboutContent = existingCourse.about || "";
      }
    } else {
      console.log("About field is undefined or null, keeping existing:", existingCourse.about);
    }

    const updateData = {
      title: title || existingCourse.title,
      description: description || existingCourse.description,
      about: aboutContent,
      shortDescription: shortDescription || description?.substring(0, 150) || existingCourse.shortDescription,
      price: price ? Number(price) : existingCourse.price,
      originalPrice: originalPrice ? Number(originalPrice) : existingCourse.originalPrice,
      thumbnail: thumbnailUrl,
      images: imagesArray,
      category: category || existingCourse.category,
      level: level || existingCourse.level,
      duration: duration || existingCourse.duration,
      instructor: instructor ? JSON.parse(instructor) : existingCourse.instructor,
      features: features ? JSON.parse(features) : existingCourse.features,
      requirements: requirements ? JSON.parse(requirements) : existingCourse.requirements,
      whatYouWillLearn: whatYouWillLearn ? JSON.parse(whatYouWillLearn) : existingCourse.whatYouWillLearn,
      tags: tags ? JSON.parse(tags) : existingCourse.tags,
      keywords: keywords || existingCourse.keywords,
      curriculum: curriculum ? JSON.parse(curriculum) : existingCourse.curriculum,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : existingCourse.isFeatured,
      isPopular: isPopular !== undefined ? isPopular === 'true' : existingCourse.isPopular,
      lessons: lessons ? JSON.parse(lessons) : existingCourse.lessons || [],
      updatedAt: new Date()
    };

    console.log("Update data being saved:", updateData);
    console.log("About field in update data:", updateData.about);
    
    await courseModel.findByIdAndUpdate(id, updateData);
    
    // Verify the update was successful
    const updatedCourse = await courseModel.findById(id);
    console.log("Course after update - about field:", updatedCourse.about);
    
    res.json({ success: true, message: "Course updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Remove course (Admin only)
const removeCourse = async (req, res) => {
  try {
    await courseModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Course removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete all courses (Admin only)
const deleteAllCourses = async (req, res) => {
  try {
    console.log("🗑️ DELETE ALL COURSES - Starting deletion process...");
    
    // Get count before deletion for confirmation
    const countBefore = await courseModel.countDocuments();
    console.log(`Found ${countBefore} courses to delete`);
    
    if (countBefore === 0) {
      return res.json({ 
        success: true, 
        message: "No courses to delete",
        deletedCount: 0 
      });
    }
    
    // Delete all courses
    const result = await courseModel.deleteMany({});
    console.log(`Deleted ${result.deletedCount} courses`);
    
    // Also delete related enrollments and reviews
    const enrollmentResult = await enrollmentModel.deleteMany({});
    const reviewResult = await reviewModel.deleteMany({});
    
    console.log(`Also deleted ${enrollmentResult.deletedCount} enrollments and ${reviewResult.deletedCount} reviews`);
    
    res.json({ 
      success: true, 
      message: `Successfully deleted all ${result.deletedCount} courses`,
      deletedCount: result.deletedCount,
      enrollmentsDeleted: enrollmentResult.deletedCount,
      reviewsDeleted: reviewResult.deletedCount
    });
  } catch (error) {
    console.error("Delete All Courses Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get featured courses
const getFeaturedCourses = async (req, res) => {
  try {
    const courses = await courseModel.find({ 
      isActive: true, 
      isFeatured: true 
    }).limit(6);
    
    res.json({ success: true, courses });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get courses by category
const getCoursesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const courses = await courseModel.find({ 
      category, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, courses });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all reviews (Admin only)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find({})
      .populate('courseId', 'title')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, reviews });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add review (Admin only)
const addReview = async (req, res) => {
  try {
    const { courseId, reviewerName, reviewerEmail, rating, comment } = req.body;

    if (!courseId || !reviewerName || !reviewerEmail || !rating || !comment) {
      return res.json({ success: false, message: "All fields are required" });
    }

    // Check if course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    const review = new reviewModel({
      courseId,
      userId: null, // No userId for admin-added reviews
      rating: parseInt(rating),
      comment,
      reviewerName,
      reviewerEmail,
      isAdminAdded: true
    });

    await review.save();

    // Update course rating
    const allReviews = await reviewModel.find({ courseId });
    const avgRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
    
    await courseModel.findByIdAndUpdate(courseId, {
      rating: avgRating,
      totalRatings: allReviews.length
    });

    res.json({ success: true, message: "Review added successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete review (Admin only)
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await reviewModel.findById(reviewId);
    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }

    const courseId = review.courseId;
    await reviewModel.findByIdAndDelete(reviewId);

    // Update course rating after deletion
    const remainingReviews = await reviewModel.find({ courseId });
    if (remainingReviews.length > 0) {
      const avgRating = remainingReviews.reduce((sum, review) => sum + review.rating, 0) / remainingReviews.length;
      await courseModel.findByIdAndUpdate(courseId, {
        rating: avgRating,
        totalRatings: remainingReviews.length
      });
    } else {
      await courseModel.findByIdAndUpdate(courseId, {
        rating: 0,
        totalRatings: 0
      });
    }

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  listCourses,
  getCourse,
  addCourse,
  updateCourse,
  removeCourse,
  deleteAllCourses,
  getFeaturedCourses,
  getCoursesByCategory,
  getAllReviews,
  addReview,
  deleteReview
};