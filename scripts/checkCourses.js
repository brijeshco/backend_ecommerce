import mongoose from 'mongoose';
import dotenv from 'dotenv';
import courseModel from '../models/courseModel.js';

// Load environment variables
dotenv.config();

const checkCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get total count
    const totalCount = await courseModel.countDocuments();
    console.log(`📊 Total courses in database: ${totalCount}`);

    if (totalCount === 0) {
      console.log('❌ No courses found in database!');
      console.log('💡 Run "npm run upload-csvjson" to upload courses from csvjson.json');
      process.exit(0);
    }

    // Get first 5 courses to check their data
    const sampleCourses = await courseModel.find({}).limit(5);
    
    console.log('\n📋 Sample courses from database:');
    sampleCourses.forEach((course, index) => {
      console.log(`\n${index + 1}. ${course.title}`);
      console.log(`   💰 Price: ${course.price} (type: ${typeof course.price})`);
      console.log(`   💰 Original Price: ${course.originalPrice} (type: ${typeof course.originalPrice})`);
      console.log(`   📚 Category: ${course.category}`);
      console.log(`   👨‍🏫 Instructor: ${course.instructor?.name || 'N/A'}`);
      console.log(`   ⭐ Rating: ${course.rating}`);
      console.log(`   👥 Students: ${course.studentsEnrolled}`);
      console.log(`   🖼️  Thumbnail: ${course.thumbnail ? 'Yes' : 'No'}`);
    });

    // Check for courses with missing prices
    const coursesWithoutPrice = await courseModel.find({ 
      $or: [
        { price: { $exists: false } },
        { price: null },
        { price: 0 }
      ]
    }).countDocuments();

    console.log(`\n⚠️  Courses without valid prices: ${coursesWithoutPrice}`);

    // Check for courses with prices
    const coursesWithPrice = await courseModel.find({ 
      price: { $gt: 0 }
    }).countDocuments();

    console.log(`✅ Courses with valid prices: ${coursesWithPrice}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking courses:', error);
    process.exit(1);
  }
};

// Run the check
checkCourses();