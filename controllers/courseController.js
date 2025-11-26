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

    // Get reviews for this course
    const reviews = await reviewModel.find({ courseId }).populate('userId', 'name avatar');
    
    res.json({ success: true, course, reviews });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add new course (Admin only)
const addCourse = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const {
      title,
      description,
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

    console.log("Uploading thumbnail to Cloudinary...");
    // Upload thumbnail to cloudinary
    const thumbnailResult = await cloudinary.uploader.upload(thumbnail.path, {
      resource_type: "image"
    });
    console.log("Thumbnail uploaded successfully:", thumbnailResult.secure_url);

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
      shortDescription,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      thumbnail: thumbnailResult.secure_url,
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
    const course = new courseModel(courseData);
    await course.save();
    console.log("Course saved successfully");

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
    const {
      title,
      description,
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

    // Handle new thumbnail upload if provided
    if (thumbnailCount && parseInt(thumbnailCount) > 0) {
      const thumbnail = req.files.thumbnail0 && req.files.thumbnail0[0];
      if (thumbnail) {
        // Upload new thumbnail to cloudinary
        const thumbnailResult = await cloudinary.uploader.upload(thumbnail.path, {
          resource_type: "image"
        });
        thumbnailUrl = thumbnailResult.secure_url;
      }
    }

    const updateData = {
      title,
      description,
      shortDescription,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      thumbnail: thumbnailUrl,
      category,
      level,
      duration,
      instructor: JSON.parse(instructor),
      features: JSON.parse(features),
      requirements: JSON.parse(requirements),
      whatYouWillLearn: JSON.parse(whatYouWillLearn),
      tags: JSON.parse(tags),
      keywords,
      curriculum: JSON.parse(curriculum),
      isFeatured: isFeatured === 'true',
      isPopular: isPopular === 'true',
      lessons: lessons ? JSON.parse(lessons) : []
    };

    await courseModel.findByIdAndUpdate(id, updateData);
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

export {
  listCourses,
  getCourse,
  addCourse,
  updateCourse,
  removeCourse,
  getFeaturedCourses,
  getCoursesByCategory
};