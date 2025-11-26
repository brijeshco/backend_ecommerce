import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    phone: { type: String },
    tradingExperience: { 
      type: String, 
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional'],
      default: 'Beginner'
    },
    interestedMarkets: [{ 
      type: String, 
      enum: ['Forex', 'Stocks', 'Crypto', 'Options', 'Futures'] 
    }],
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'course' }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'course' }],
    cartData: { type: Object, default: {} }, // Keep for course cart functionality
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
