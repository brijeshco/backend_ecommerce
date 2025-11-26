import enrollmentModel from "../models/enrollmentModel.js";
import courseModel from "../models/courseModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Enroll in course with payment
const enrollInCourse = async (req, res) => {
  try {
    const { userId, courseId, paymentMethod } = req.body;
    
    // Check if already enrolled
    const existingEnrollment = await enrollmentModel.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.json({ success: false, message: "Already enrolled in this course" });
    }

    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    const enrollmentData = {
      userId,
      courseId,
      progress: {
        totalLessons: course.lessons.length,
        progressPercentage: 0,
        completedLessons: [],
        lastAccessedLesson: 0
      },
      paymentDetails: {
        amount: course.price,
        paymentMethod,
        paymentStatus: paymentMethod === 'free' ? 'completed' : 'pending'
      }
    };

    if (paymentMethod === 'stripe') {
      // Create Stripe payment session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.shortDescription,
              images: [course.thumbnail]
            },
            unit_amount: course.price * 100, // Convert to cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.origin}/course-success?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}`,
        cancel_url: `${req.headers.origin}/course/${courseId}`,
        metadata: {
          userId,
          courseId
        }
      });

      // Save enrollment with pending status
      const enrollment = new enrollmentModel({
        ...enrollmentData,
        paymentDetails: {
          ...enrollmentData.paymentDetails,
          transactionId: session.id
        }
      });
      await enrollment.save();

      return res.json({ success: true, sessionUrl: session.url });
    }

    // For free courses or other payment methods
    const enrollment = new enrollmentModel(enrollmentData);
    await enrollment.save();

    // Update user's enrolled courses
    await userModel.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId }
    });

    // Update course enrollment count
    await courseModel.findByIdAndUpdate(courseId, {
      $inc: { studentsEnrolled: 1 }
    });

    res.json({ success: true, message: "Successfully enrolled in course" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe payment and complete enrollment
const verifyEnrollment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const { userId, courseId } = session.metadata;
      
      // Update enrollment status
      await enrollmentModel.findOneAndUpdate(
        { userId, courseId, 'paymentDetails.transactionId': sessionId },
        { 'paymentDetails.paymentStatus': 'completed' }
      );

      // Update user's enrolled courses
      await userModel.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: courseId }
      });

      // Update course enrollment count
      await courseModel.findByIdAndUpdate(courseId, {
        $inc: { studentsEnrolled: 1 }
      });

      res.json({ success: true, message: "Payment verified and enrollment completed" });
    } else {
      res.json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get user enrollments
const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const enrollments = await enrollmentModel.find({ 
      userId, 
      'paymentDetails.paymentStatus': 'completed' 
    }).populate('courseId');
    
    res.json({ success: true, enrollments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update lesson progress
const updateProgress = async (req, res) => {
  try {
    const { userId, courseId, lessonOrder } = req.body;
    
    const enrollment = await enrollmentModel.findOne({ userId, courseId });
    if (!enrollment) {
      return res.json({ success: false, message: "Enrollment not found" });
    }

    // Add lesson to completed if not already completed
    if (!enrollment.progress.completedLessons.includes(lessonOrder)) {
      enrollment.progress.completedLessons.push(lessonOrder);
      enrollment.progress.progressPercentage = 
        (enrollment.progress.completedLessons.length / enrollment.progress.totalLessons) * 100;
    }

    enrollment.progress.lastAccessedLesson = lessonOrder;
    await enrollment.save();

    res.json({ success: true, progress: enrollment.progress });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  enrollInCourse,
  verifyEnrollment,
  getUserEnrollments,
  updateProgress
};