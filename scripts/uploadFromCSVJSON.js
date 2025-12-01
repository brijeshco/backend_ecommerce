import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import courseModel from '../models/courseModel.js';

// Load environment variables
dotenv.config();

// Course image generator function with improved reliability
const generateCourseImage = (courseName, category = 'Trading Courses', width = 400, height = 300) => {
  const getCategoryColor = (cat) => {
    const colors = {
      'Trading': '0066cc',
      'Business': '28a745', 
      'Marketing': 'fd7e14',
      'Money Making': '6f42c1',
      'AI': 'dc3545',
      'Design': '17a2b8',
      'SEO': '6c757d',
      'Youtube': 'ffc107',
      'Forex': '20c997',
      'Crypto': 'f8cf0f',
      'Dropshipping': 'e83e8c',
      'Affiliate': '6610f2',
      'default': '343a40'
    };
    return colors[cat] || colors.default;
  };
  
  const color = getCategoryColor(category);
  
  // Clean the course name for URL - remove special characters and limit length
  const cleanName = courseName
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '+') // Replace spaces with +
    .substring(0, 25); // Limit length for better display
  
  // Use placehold.co for better reliability
  return `https://placehold.co/${width}x${height}/${color}/ffffff?text=${cleanName}&font=roboto`;
};

// Price cleaning function
const cleanPrice = (priceString) => {
  if (!priceString) return 0;
  // Remove $ and commas, then convert to float
  return parseFloat(priceString.replace(/[$,]/g, '')) || 0;
};

// Enhanced category mapping
const mapCategory = (originalCategory) => {
  const categoryMap = {
    'Trading': 'Trading Courses',
    'Business': 'Business Courses', 
    'Marketing': 'Marketing Courses',
    'Money Making': 'Business Courses',
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

// Process course data from csvjson format
const processCourseData = (courseArray) => {
  return courseArray.map((course, index) => {
    const cleanName = course["Product Name"]?.trim() || `Course ${index + 1}`;
    const category = mapCategory(course["Product Category"] || 'Trading');
    const instructor = extractInstructor(cleanName);
    
    // Clean prices
    const originalPrice = cleanPrice(course["Original Price (USD)"]);
    const currentPrice = cleanPrice(course["Current Price (USD)"]);
    
    // Calculate discount percentage if not provided
    let discountPercentage = 0;
    if (originalPrice > 0 && currentPrice > 0) {
      discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
    
    return {
      title: cleanName,
      description: generateDescription(cleanName, category),
      about: generateAbout(category),
      shortDescription: `Master ${category.toLowerCase().replace(' courses', '')} with ${instructor}. Comprehensive training with practical examples.`,
      price: currentPrice,
      originalPrice: originalPrice,
      thumbnail: generateCourseImage(cleanName, course["Product Category"] || 'Trading', 400, 300),
      images: [
        generateCourseImage(cleanName, course["Product Category"] || 'Trading', 400, 300),
        generateCourseImage(cleanName, course["Product Category"] || 'Trading', 800, 400),
        generateCourseImage(cleanName, course["Product Category"] || 'Trading', 600, 400)
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
  const parts = courseName.split('–'); // Note: this is an em dash, not regular dash
  if (parts.length > 1) {
    return parts[0].trim();
  }
  
  // Try regular dash
  const dashParts = courseName.split('--');
  if (dashParts.length > 1) {
    return dashParts[0].trim();
  }
  
  // Try single dash
  const singleDashParts = courseName.split('-');
  if (singleDashParts.length > 1) {
    return singleDashParts[0].trim();
  }
  
  // Extract from common patterns
  const patterns = [
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
  const topicName = courseName.split('–')[1]?.trim() || courseName.split('--')[1]?.trim() || 'Course Content';
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

// Main upload function
const uploadFromCSVJSON = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read the csvjson.json file
    const jsonFilePath = path.join(process.cwd(), 'csvjson.json');
    
    if (!fs.existsSync(jsonFilePath)) {
      console.log('❌ csvjson.json file not found!');
      process.exit(1);
    }

    console.log('📁 Reading courses from csvjson.json...');
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    const courseData = JSON.parse(fileContent);

    console.log(`📊 Found ${courseData.length} courses to process...`);

    // Process courses in batches to avoid memory issues
    const batchSize = 50;
    let totalUploaded = 0;
    let totalSkipped = 0;

    for (let i = 0; i < courseData.length; i += batchSize) {
      const batch = courseData.slice(i, i + batchSize);
      const processedBatch = processCourseData(batch);
      
      console.log(`⏳ Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(courseData.length/batchSize)} (${processedBatch.length} courses)...`);
      
      try {
        // Check for existing courses to avoid duplicates
        const existingTitles = await courseModel.find({
          title: { $in: processedBatch.map(course => course.title) }
        }).select('title');
        
        const existingTitleSet = new Set(existingTitles.map(course => course.title));
        const newCourses = processedBatch.filter(course => !existingTitleSet.has(course.title));
        
        if (newCourses.length > 0) {
          const result = await courseModel.insertMany(newCourses);
          totalUploaded += result.length;
          console.log(`✅ Uploaded ${result.length} new courses. Skipped ${processedBatch.length - newCourses.length} duplicates.`);
        } else {
          console.log(`⚠️  All ${processedBatch.length} courses in this batch already exist. Skipping...`);
        }
        
        totalSkipped += (processedBatch.length - (newCourses?.length || 0));
        
      } catch (batchError) {
        console.log(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, batchError.message);
        continue;
      }
    }

    console.log('\n🎉 === UPLOAD COMPLETE ===');
    console.log(`✅ Successfully uploaded ${totalUploaded} new courses to database!`);
    console.log(`⚠️  Skipped ${totalSkipped} duplicate courses`);
    console.log(`📊 Total courses processed: ${courseData.length}`);
    console.log(`🎨 All courses have auto-generated placeholder images`);
    console.log(`💰 Pricing information cleaned and processed`);
    console.log(`👨‍🏫 Instructor information extracted from course names`);

    // Show sample of uploaded courses
    const sampleCourses = await courseModel.find({}).limit(5).sort({ createdAt: -1 });
    console.log('\n📋 Sample recently uploaded courses:');
    sampleCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   💰 Price: $${course.price} (was $${course.originalPrice})`);
      console.log(`   📚 Category: ${course.category}`);
      console.log(`   👨‍🏫 Instructor: ${course.instructor.name}`);
      console.log(`   🖼️  Image: ${course.thumbnail}`);
      console.log('');
    });

    // Show total count
    const totalCount = await courseModel.countDocuments();
    console.log(`📈 Total courses in database: ${totalCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading courses:', error);
    process.exit(1);
  }
};

// Run the upload
uploadFromCSVJSON();