import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
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
      'Forex Courses': '20c997',
      'Crypto Courses': 'f8cf0f',
      'Dropshipping Courses': 'e83e8c',
      'Affiliate Marketing Courses': '6610f2',
      'default': '343a40'
    };
    return colors[cat] || colors.default;
  };
  
  const color = getCategoryColor(category);
  
  // Clean the course name for URL - remove special characters and limit length
  const cleanName = courseName
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '+') // Replace spaces with +
    .substring(0, 30); // Limit length
  
  // Use a more reliable placeholder service
  return `https://placehold.co/${width}x${height}/${color}/ffffff?text=${cleanName}&font=roboto`;
};

// Enhanced category mapping
const mapCategory = (originalCategory) => {
  const categoryMap = {
    'Trading': 'Trading Courses',
    'Business': 'Business Courses', 
    'Marketing': 'Marketing Courses',
    'AI': 'AI Courses',
    'Design': 'Design Courses',
    'E-commerce': 'E-commerce Courses',
    'SEO': 'SEO Courses',
    'YouTube': 'Youtube Courses',
    'Forex': 'Forex Courses',
    'Crypto': 'Crypto Courses',
    'Dropshipping': 'Dropshipping Courses',
    'Affiliate': 'Affiliate Marketing Courses',
    'Programming': 'Web Design and Development Courses',
    'Development': 'Web Design and Development Courses'
  };
  return categoryMap[originalCategory] || 'Trading Courses';
};

// Process course data in batches
const processCourseData = (courseArray) => {
  return courseArray.map((course, index) => {
    const cleanName = course["Product Name"]?.trim() || `Course ${index + 1}`;
    const category = mapCategory(course["Product Category"] || 'Trading');
    const instructor = extractInstructor(cleanName);
    
    return {
      title: cleanName,
      description: generateDescription(cleanName, category),
      about: generateAbout(category),
      shortDescription: `Master ${category.toLowerCase().replace(' courses', '')} with ${instructor}. Comprehensive training with practical examples.`,
      price: parseFloat(course["Current Price (USD)"]) || 9.99,
      originalPrice: parseFloat(course["Original Price (USD)"]) || 99,
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
        bio: `${instructor} is a seasoned professional with extensive experience in ${category.toLowerCase().replace(' courses', '')}. Known for practical teaching methods and delivering real-world results.`,
        avatar: `https://placehold.co/150x150/4f46e5/ffffff?text=${instructor.charAt(0)}&font=roboto`,
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
        'Downloadable Resources',
        '24/7 Support'
      ],
      requirements: [
        'Basic computer skills',
        'Internet connection',
        'Willingness to learn',
        'No prior experience required'
      ],
      whatYouWillLearn: generateLearningOutcomes(category),
      tags: [category.replace(' Courses', ''), 'Professional', 'Expert Level', 'Practical'],
      keywords: `${cleanName}, ${category}, ${instructor}, online course, training, professional`,
      curriculum: generateCurriculum(),
      rating: 0, // Start with no rating
      totalRatings: 0, // No reviews initially
      studentsEnrolled: 0, // No students initially
      isActive: true,
      isFeatured: Math.random() > 0.85,
      isPopular: Math.random() > 0.75,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });
};

// Helper functions
const extractInstructor = (courseName) => {
  const parts = courseName.split('--');
  if (parts.length > 1) {
    return parts[0].trim();
  }
  // Extract from common patterns
  const patterns = [
    /^([A-Za-z\s]+)\s*-/,
    /^([A-Za-z\s]+)\s*:/,
    /^([A-Za-z\s]+)\s+Course/i
  ];
  
  for (const pattern of patterns) {
    const match = courseName.match(pattern);
    if (match) return match[1].trim();
  }
  
  return 'Expert Instructor';
};

const generateDescription = (courseName, category) => {
  return `Professional ${category.toLowerCase().replace(' courses', '')} course: ${courseName}. 

This comprehensive training program is designed to provide you with practical skills and expert knowledge. You'll learn from industry professionals who have real-world experience and proven track records.

Key highlights:
• Step-by-step instruction from basics to advanced concepts
• Real-world examples and case studies
• Practical exercises and assignments
• Industry best practices and insider tips
• Lifetime access to all course materials

Whether you're a beginner looking to start your journey or an experienced professional wanting to enhance your skills, this course provides the knowledge and tools you need to succeed.`;
};

const generateAbout = (category) => {
  return `This ${category.toLowerCase().replace(' courses', '')} course is meticulously crafted for learners who are serious about mastering their craft. Our curriculum combines theoretical knowledge with hands-on practice, ensuring you gain both understanding and practical skills.

You'll benefit from:
- Expert instruction from industry leaders
- Comprehensive curriculum covering all essential topics  
- Practical projects that build real-world skills
- Community support and networking opportunities
- Ongoing updates to keep content current

Join thousands of successful students who have transformed their careers through our proven teaching methodology.`;
};

const generateLearningOutcomes = (category) => {
  const baseOutcomes = [
    `Master the fundamentals of ${category.toLowerCase().replace(' courses', '')}`,
    'Apply advanced strategies and techniques effectively',
    'Develop practical skills for real-world scenarios',
    'Build confidence in your professional abilities',
    'Create high-quality, professional work'
  ];
  
  const categorySpecific = {
    'Trading Courses': [
      'Understand market dynamics and price action',
      'Develop profitable trading strategies',
      'Master risk management techniques'
    ],
    'Business Courses': [
      'Build and scale successful businesses',
      'Develop leadership and management skills',
      'Create effective business strategies'
    ],
    'Marketing Courses': [
      'Create compelling marketing campaigns',
      'Master digital marketing channels',
      'Analyze and optimize marketing performance'
    ]
  };
  
  return [...baseOutcomes, ...(categorySpecific[category] || [])];
};

const getRandomLevel = () => {
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const weights = [0.4, 0.4, 0.2]; // More beginner/intermediate courses
  const random = Math.random();
  let sum = 0;
  
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random <= sum) return levels[i];
  }
  return levels[0];
};

const getRandomDuration = () => {
  const durations = ['2-4 hours', '1-2 weeks', '3-5 hours', '1 week', '2-3 weeks', '4-6 hours'];
  return durations[Math.floor(Math.random() * durations.length)];
};

const generateSampleLessons = (courseName) => {
  const topicName = courseName.split('--')[1]?.trim() || 'Course Content';
  return [
    {
      title: `Introduction to ${topicName}`,
      description: 'Course overview, objectives, and what you\'ll achieve',
      videoUrl: 'https://example.com/video1',
      duration: '15 mins',
      order: 1,
      resources: []
    },
    {
      title: 'Fundamentals and Core Concepts',
      description: 'Essential knowledge and foundational principles',
      videoUrl: 'https://example.com/video2', 
      duration: '25 mins',
      order: 2,
      resources: []
    },
    {
      title: 'Advanced Strategies and Techniques',
      description: 'Professional-level methods and advanced approaches',
      videoUrl: 'https://example.com/video3',
      duration: '30 mins',
      order: 3,
      resources: []
    },
    {
      title: 'Practical Implementation',
      description: 'Hands-on exercises and real-world applications',
      videoUrl: 'https://example.com/video4',
      duration: '35 mins',
      order: 4,
      resources: []
    }
  ];
};

const generateCurriculum = () => {
  return [
    { title: 'Course Introduction and Overview', duration: '30 mins' },
    { title: 'Fundamentals and Basic Concepts', duration: '2 hours' },
    { title: 'Intermediate Techniques and Methods', duration: '3 hours' },
    { title: 'Advanced Strategies and Applications', duration: '4 hours' },
    { title: 'Practical Projects and Case Studies', duration: '3 hours' },
    { title: 'Final Assessment and Certification', duration: '1 hour' }
  ];
};

// Main upload function with batch processing
const uploadBulkCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if JSON file exists
    const jsonFilePath = path.join(process.cwd(), 'courses-data.json');
    let courseData = [];

    if (fs.existsSync(jsonFilePath)) {
      console.log('📁 Reading courses from courses-data.json...');
      const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
      courseData = JSON.parse(fileContent);
    } else {
      console.log('⚠️  courses-data.json not found. Using sample data...');
      // Use sample data if file doesn't exist
      courseData = [
        {"Product Name" : "Mike Valtos -- Order Flow Dynamics","Original Price (USD)" : "297","Current Price (USD)" : "9.99","Discount Percentage" : "97","Product Category" : "Trading"},
        {"Product Name" : "Mike Valtos -- Order Flow By The Numbers","Original Price (USD)" : "99","Current Price (USD)" : "29.99","Discount Percentage" : "70","Product Category" : "Trading"},
        {"Product Name" : "BKForex -- All Courses Bundle","Original Price (USD)" : "1000","Current Price (USD)" : "19.99","Discount Percentage" : "98","Product Category" : "Trading"}
      ];
    }

    console.log(`📊 Processing ${courseData.length} courses...`);

    // Process courses in batches to avoid memory issues
    const batchSize = 50;
    let totalUploaded = 0;

    for (let i = 0; i < courseData.length; i += batchSize) {
      const batch = courseData.slice(i, i + batchSize);
      const processedBatch = processCourseData(batch);
      
      console.log(`⏳ Uploading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(courseData.length/batchSize)} (${processedBatch.length} courses)...`);
      
      const result = await courseModel.insertMany(processedBatch);
      totalUploaded += result.length;
      
      console.log(`✅ Batch uploaded successfully! Total: ${totalUploaded}/${courseData.length}`);
    }

    console.log('\n🎉 === UPLOAD COMPLETE ===');
    console.log(`✅ Successfully uploaded ${totalUploaded} courses to database!`);
    console.log(`📊 All courses have auto-generated placeholder images`);
    console.log(`🎨 Images use category-based color schemes`);
    console.log(`💰 Pricing and discount information preserved`);
    console.log(`👨‍🏫 Instructor information extracted from course names`);

    // Show sample of uploaded courses
    const sampleCourses = await courseModel.find({}).limit(3);
    console.log('\n📋 Sample uploaded courses:');
    sampleCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   💰 Price: $${course.price} (was $${course.originalPrice})`);
      console.log(`   📚 Category: ${course.category}`);
      console.log(`   👨‍🏫 Instructor: ${course.instructor.name}`);
      console.log(`   🖼️  Image: ${course.thumbnail}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading courses:', error);
    process.exit(1);
  }
};

// Run the upload
uploadBulkCourses();