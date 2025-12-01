import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  about: { type: String }, // Additional about information
  shortDescription: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number }, // For showing discounts
  thumbnail: { type: String, required: true },
  images: [{ type: String }], // Array of course images
  previewVideo: { type: String }, // Preview video URL
  category: { 
    type: String, 
    required: true,
    enum: [
      'Ads Courses',
      'Affiliate Marketing Courses',
      'Agency Courses',
      'AI Courses',
      'Amazon Courses',
      'Best Courses',
      'Blogging Courses',
      'Business Courses',
      'Copywriting Courses',
      'Crypto Courses',
      'Dating & Relationships',
      'Design Courses',
      'Dropshipping Courses',
      'E-commerce Courses',
      'Email Marketing',
      'Forex Courses',
      'LinkedIn Courses',
      'Marketing Courses',
      'Music Courses',
      'Notion Courses',
      'Personal Development',
      'Premium Courses',
      'Productivity & Growth',
      'Real Estate Courses',
      'SAAS Courses',
      'Sales & Business Courses',
      'Sales Courses',
      'SEO Courses',
      'Social Media Courses',
      'TikTok Courses',
      'Trading Courses',
      'Video Editing & Design',
      'Web Design and Development Courses',
      'Youtube Courses'
    ]
  },
  level: { 
    type: String, 
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: { type: String, required: true }, // e.g., "4 hours", "2 weeks"
  lessons: [{
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    duration: { type: String }, // e.g., "15 mins"
    order: { type: Number, required: true },
    resources: [{ 
      title: String, 
      url: String, 
      type: { type: String, enum: ['pdf', 'excel', 'link', 'image'] }
    }]
  }],
  instructor: {
    name: { type: String, required: true },
    bio: { type: String },
    avatar: { type: String },
    experience: { type: String },
    socialLinks: {
      twitter: String,
      linkedin: String,
      youtube: String
    }
  },
  features: [{ type: String }], // Course highlights
  requirements: [{ type: String }], // Prerequisites
  whatYouWillLearn: [{ type: String }], // Learning outcomes
  tags: [{ type: String }],
  keywords: { type: String }, // SEO keywords
  curriculum: [{ // Course curriculum/outline
    title: { type: String },
    duration: { type: String }
  }],
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  studentsEnrolled: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const courseModel = mongoose.models.course || mongoose.model("course", courseSchema);

export default courseModel;