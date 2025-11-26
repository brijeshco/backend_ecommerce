import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: false }, // Made optional for admin-added reviews
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isVerifiedPurchase: { type: Boolean, default: false },
  // Fields for admin-added reviews
  reviewerName: { type: String, required: false },
  reviewerEmail: { type: String, required: false },
  isAdminAdded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Modified index to allow admin-added reviews without userId
reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true, sparse: true });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;