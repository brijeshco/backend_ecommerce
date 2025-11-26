import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'course', required: true },
  enrolledAt: { type: Date, default: Date.now },
  progress: {
    completedLessons: [{ type: Number }], // Array of lesson orders completed
    totalLessons: { type: Number, required: true },
    progressPercentage: { type: Number, default: 0 },
    lastAccessedLesson: { type: Number, default: 0 }
  },
  paymentDetails: {
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
  },
  certificateIssued: { type: Boolean, default: false },
  certificateUrl: { type: String },
  isActive: { type: Boolean, default: true }
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const enrollmentModel = mongoose.models.enrollment || mongoose.model("enrollment", enrollmentSchema);

export default enrollmentModel;