import mongoose from 'mongoose';
import dotenv from 'dotenv';
import courseModel from '../models/courseModel.js';

// Load environment variables
dotenv.config();

// Course image generator function
const generateCourseImage = (courseName, category = 'Trading Courses', width = 400, height = 300) => {
  const getCategoryColor = (cat) => {
    const colors = {
      'Trading Courses': '0066cc',
      'Business Courses': '28a745',
      'Marketing Courses': 'fd7e14',
      'AI Courses': '6f42c1',
      'Design Courses': 'dc3545',
      'E-commerce Courses': '17a2b8',
      'SEO Courses': '6c757d',
      'Youtube Courses': 'ffc107',
      'default': '343a40'
    };
    return colors[cat] || colors.default;
  };
  
  const color = getCategoryColor(category);
  const encodedName = encodeURIComponent(courseName.substring(0, 50));
  return `https://via.placeholder.com/${width}x${height}/${color}/ffffff?text=${encodedName}`;
};

// Process course data to match your schema
const processCourseData = (courseArray) => {
  return courseArray.map((course, index) => {
    const cleanName = course["Product Name"].trim();
    const category = mapCategory(course["Product Category"]);
    const instructor = extractInstructor(cleanName);
    
    return {
      title: cleanName,
      description: `Professional ${category.toLowerCase().replace(' courses', '')} course: ${cleanName}. Learn from industry experts with comprehensive curriculum and practical examples. This course covers essential concepts, advanced strategies, and real-world applications to help you master the subject.`,
      about: `This comprehensive course is designed for learners who want to excel in ${category.toLowerCase().replace(' courses', '')}. You'll gain practical skills, learn industry best practices, and develop the expertise needed to succeed in today's competitive market.`,
      shortDescription: `Master ${category.toLowerCase().replace(' courses', '')} with ${instructor}. Comprehensive training with practical examples and expert guidance.`,
      price: parseFloat(course["Current Price (USD)"]) || 0,
      originalPrice: parseFloat(course["Original Price (USD)"]) || 0,
      thumbnail: generateCourseImage(cleanName, category, 400, 300),
      images: [
        generateCourseImage(cleanName, category, 400, 300),
        generateCourseImage(cleanName, category, 800, 400),
        generateCourseImage(cleanName, category, 600, 400)
      ],
      previewVideo: null,
      category: category,
      level: getRandomLevel(),
      duration: getRandomDuration(),
      lessons: generateSampleLessons(cleanName),
      instructor: {
        name: instructor,
        bio: `${instructor} is a seasoned professional with years of experience in ${category.toLowerCase().replace(' courses', '')}. Known for practical teaching methods and real-world insights.`,
        avatar: `https://via.placeholder.com/150x150/4f46e5/ffffff?text=${instructor.charAt(0)}`,
        experience: `${Math.floor(Math.random() * 10) + 5}+ years`,
        socialLinks: {
          twitter: `https://twitter.com/${instructor.toLowerCase().replace(/\s+/g, '')}`,
          linkedin: `https://linkedin.com/in/${instructor.toLowerCase().replace(/\s+/g, '-')}`,
          youtube: `https://youtube.com/@${instructor.toLowerCase().replace(/\s+/g, '')}`
        }
      },
      features: [
        'Lifetime Access',
        'Expert Instruction',
        'Practical Examples',
        'Community Support',
        'Certificate of Completion',
        'Mobile Access',
        'Downloadable Resources'
      ],
      requirements: [
        'Basic computer skills',
        'Internet connection',
        'Willingness to learn',
        'No prior experience required'
      ],
      whatYouWillLearn: [
        `Master the fundamentals of ${category.toLowerCase().replace(' courses', '')}`,
        'Apply advanced strategies and techniques',
        'Develop practical skills for real-world scenarios',
        'Build confidence in your abilities',
        'Create professional-quality work'
      ],
      tags: [category.replace(' Courses', ''), 'Professional', 'Expert Level', 'Practical'],
      keywords: `${cleanName}, ${category}, ${instructor}, online course, training`,
      curriculum: [
        { title: 'Introduction and Fundamentals', duration: '2 hours' },
        { title: 'Core Concepts and Principles', duration: '3 hours' },
        { title: 'Advanced Techniques', duration: '4 hours' },
        { title: 'Practical Applications', duration: '3 hours' },
        { title: 'Final Project and Certification', duration: '2 hours' }
      ],
      rating: 0, // Start with no rating
      totalRatings: 0, // No reviews initially
      studentsEnrolled: 0, // No students initially
      isActive: true,
      isFeatured: Math.random() > 0.8,
      isPopular: Math.random() > 0.7,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });
};

// Helper functions
const mapCategory = (originalCategory) => {
  const categoryMap = {
    'Trading': 'Trading Courses',
    'Business': 'Business Courses',
    'Marketing': 'Marketing Courses',
    'AI': 'AI Courses',
    'Design': 'Design Courses',
    'E-commerce': 'E-commerce Courses'
  };
  return categoryMap[originalCategory] || 'Trading Courses';
};

const extractInstructor = (courseName) => {
  const parts = courseName.split('--');
  return parts[0]?.trim() || 'Expert Instructor';
};

const getRandomLevel = () => {
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  return levels[Math.floor(Math.random() * levels.length)];
};

const getRandomDuration = () => {
  const durations = ['2-4 hours', '1-2 weeks', '3-5 hours', '1 week', '2-3 weeks'];
  return durations[Math.floor(Math.random() * durations.length)];
};

const generateSampleLessons = (courseName) => {
  return [
    {
      title: `Introduction to ${courseName.split('--')[1]?.trim() || 'Course Content'}`,
      description: 'Course overview and learning objectives',
      videoUrl: 'https://example.com/video1',
      duration: '15 mins',
      order: 1,
      resources: []
    },
    {
      title: 'Core Concepts and Fundamentals',
      description: 'Essential knowledge and basic principles',
      videoUrl: 'https://example.com/video2',
      duration: '25 mins',
      order: 2,
      resources: []
    },
    {
      title: 'Advanced Strategies and Techniques',
      description: 'Professional-level methods and approaches',
      videoUrl: 'https://example.com/video3',
      duration: '30 mins',
      order: 3,
      resources: []
    }
  ];
};

// Your course data
const courseData = [
  {"Product Name" : "Mike Valtos -- Order Flow Dynamics","Product URL" : "https://tradesmint.com/product/mike-valtos-order-flow-dynamics/","Product Image" : "https://tradesmint.com/wp-content/uploads/2025/11/Mike-Valtos-Order-Flow-Dynamics-300x300.png,https://tradesmint.com/wp-content/uploads/2025/11/Mike-Valtos-Order-Flow-Dynamics-1-300x300.png","Original Price (USD)" : "297","Current Price (USD)" : "9.99","Discount Percentage" : "97","Product Category" : "Trading"},
  {"Product Name" : "Mike Valtos -- Order Flow By The Numbers","Product URL" : "https://tradesmint.com/product/mike-valtos-order-flow-by-the-numbers/","Product Image" : "https://tradesmint.com/wp-content/uploads/2025/11/Mike-Valtos-Order-Flow-By-The-Numbers-300x300.png,https://tradesmint.com/wp-content/uploads/2025/11/Mike-Valtos-Order-Flow-By-The-Numbers-1-300x300.png","Original Price (USD)" : "99","Current Price (USD)" : "29.99","Discount Percentage" : "70","Product Category" : "Trading"},
  {"Product Name" : "BKForex -- All Courses Bundle","Product URL" : "https://tradesmint.com/product/bkforex-all-courses-bundle/","Product Image" : "https://tradesmint.com/wp-content/uploads/2025/11/BKForex-All-Courses-Bundle-300x300.png,https://tradesmint.com/wp-content/uploads/2025/11/BKForex-All-Courses-Bundle-1-300x300.png","Original Price (USD)" : "1000","Current Price (USD)" : "19.99","Discount Percentage" : "98","Product Category" : "Trading"},
  {"Product Name" : "John Ehlers -- MESA Workshop","Product URL" : "https://tradesmint.com/product/john-ehlers-mesa-workshop/","Product Image" : "https://tradesmint.com/wp-content/uploads/2025/11/John-Ehlers-MESA-Workshop-300x300.png,https://tradesmint.com/wp-content/uploads/2025/11/John-Ehlers-MESA-Workshop-1-300x300.png","Original Price (USD)" : "4000","Current Price (USD)" : "49.99","Discount Percentage" : "99","Product Category" : "Trading"},
  {"Product Name" : "SJG Trades -- Flyagonal Deep Dive Course","Product URL" : "https://tradesmint.com/product/sjg-trades-flyagonal-deep-dive-course/","Product Image" : "https://tradesmint.com/wp-content/uploads/2025/11/SJG-Trades-Flyagonal-Deep-Dive-Course-300x300.png,https://tradesmint.com/wp-content/uploads/2025/11/SJG-Trades-Flyagonal-Deep-Dive-Course-1-300x300.png","Original Price (USD)" : "995","Current Price (USD)" : "99","Discount Percentage" : "90","Product Category" : "Trading"}
];

// Main upload function
const uploadCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Process the course data
    const processedCourses = processCourseData(courseData);
    console.log(`Processing ${processedCourses.length} courses...`);

    // Clear existing courses (optional - remove this line if you want to keep existing data)
    // await courseModel.deleteMany({});
    // console.log('Cleared existing courses');

    // Insert new courses
    const result = await courseModel.insertMany(processedCourses);
    console.log(`Successfully uploaded ${result.length} courses to database!`);

    // Display summary
    console.log('\n=== UPLOAD SUMMARY ===');
    result.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   Price: $${course.price} (was $${course.originalPrice})`);
      console.log(`   Category: ${course.category}`);
      console.log(`   Instructor: ${course.instructor.name}`);
      console.log(`   Image: ${course.thumbnail}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error uploading courses:', error);
    process.exit(1);
  }
};

// Run the upload
uploadCourses();