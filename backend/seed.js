require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/course');
const User = require('./models/user');

const sampleCourses = [
    {
        title: 'Soil Health Basics',
        slug: 'soil-health-basics',
        description: 'Learn the fundamentals of building and maintaining healthy soil for sustainable farming. This comprehensive course covers soil composition, testing methods, and practical techniques to improve soil fertility.',
        category: 'Soil Management',
        coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop',
        price: 0,
        currency: 'KES',
        isFree: true,
        lessons: [
            {
                title: 'Introduction to Soil Science',
                contentHtml: '<h2>What is Soil?</h2><p>Soil is a complex mixture of minerals, organic matter, water, and air that supports plant life...</p>',
                videoUrl: 'https://example.com/video1',
                duration: '15 minutes',
                order: 1
            },
            {
                title: 'Soil Testing Methods',
                contentHtml: '<h2>How to Test Your Soil</h2><p>Learn various methods to test soil pH, nutrient levels, and composition...</p>',
                videoUrl: 'https://example.com/video2',
                duration: '20 minutes',
                order: 2
            },
            {
                title: 'Improving Soil Fertility',
                contentHtml: '<h2>Natural Soil Improvement</h2><p>Discover organic methods to enhance soil fertility and structure...</p>',
                videoUrl: 'https://example.com/video3',
                duration: '25 minutes',
                order: 3
            }
        ]
    },
    {
        title: 'Irrigation 101',
        slug: 'irrigation-101',
        description: 'Master efficient irrigation techniques to optimize water usage and maximize crop yields. Learn about different irrigation systems, water management, and sustainable practices.',
        category: 'Water Management',
        coverImage: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1600&auto=format&fit=crop',
        price: 75,
        currency: 'KES',
        isFree: false,
        lessons: [
            {
                title: 'Understanding Water Needs',
                contentHtml: '<h2>Plant Water Requirements</h2><p>Learn how different crops have varying water needs throughout their growth cycle...</p>',
                videoUrl: 'https://example.com/video4',
                duration: '18 minutes',
                order: 1
            },
            {
                title: 'Irrigation System Types',
                contentHtml: '<h2>Choosing the Right System</h2><p>Compare drip, sprinkler, and flood irrigation methods...</p>',
                videoUrl: 'https://example.com/video5',
                duration: '22 minutes',
                order: 2
            },
            {
                title: 'Water Conservation Techniques',
                contentHtml: '<h2>Saving Water on the Farm</h2><p>Implement strategies to reduce water waste and improve efficiency...</p>',
                videoUrl: 'https://example.com/video6',
                duration: '20 minutes',
                order: 3
            }
        ]
    },
    {
        title: 'Organic Pest Control',
        slug: 'organic-pest-control',
        description: 'Protect your crops using safe, environmentally friendly pest management strategies. Learn about beneficial insects, natural repellents, and integrated pest management.',
        category: 'Pest Management',
        coverImage: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=1600&auto=format&fit=crop',
        price: 100,
        currency: 'KES',
        isFree: false,
        lessons: [
            {
                title: 'Identifying Common Pests',
                contentHtml: '<h2>Know Your Enemy</h2><p>Learn to identify common agricultural pests and their damage patterns...</p>',
                videoUrl: 'https://example.com/video7',
                duration: '16 minutes',
                order: 1
            },
            {
                title: 'Beneficial Insects',
                contentHtml: '<h2>Nature\'s Pest Controllers</h2><p>Discover how beneficial insects can help control pest populations...</p>',
                videoUrl: 'https://example.com/video8',
                duration: '19 minutes',
                order: 2
            },
            {
                title: 'Natural Pest Repellents',
                contentHtml: '<h2>Homemade Solutions</h2><p>Create effective pest repellents using common household ingredients...</p>',
                videoUrl: 'https://example.com/video9',
                duration: '21 minutes',
                order: 3
            }
        ]
    },
    {
        title: 'Advanced Crop Management',
        slug: 'advanced-crop-management',
        description: 'Master advanced techniques for maximizing crop yields and quality. Learn about crop rotation, intercropping, precision farming, and modern agricultural technologies.',
        category: 'Crop Management',
        coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop',
        price: 150,
        currency: 'KES',
        isFree: false,
        lessons: [
            {
                title: 'Crop Rotation Strategies',
                contentHtml: '<h2>Planning Your Crop Rotation</h2><p>Learn how to plan effective crop rotations to maintain soil health and prevent pest buildup...</p>',
                videoUrl: 'https://example.com/video13',
                duration: '20 minutes',
                order: 1
            },
            {
                title: 'Intercropping Techniques',
                contentHtml: '<h2>Growing Multiple Crops Together</h2><p>Discover how to grow different crops together for maximum space utilization and pest control...</p>',
                videoUrl: 'https://example.com/video14',
                duration: '18 minutes',
                order: 2
            },
            {
                title: 'Precision Farming Tools',
                contentHtml: '<h2>Technology in Agriculture</h2><p>Explore modern tools and technologies that can help optimize your farming operations...</p>',
                videoUrl: 'https://example.com/video15',
                duration: '25 minutes',
                order: 3
            }
        ]
    },
    {
        title: 'Market Readiness',
        slug: 'market-readiness',
        description: 'Prepare your produce for market success. Learn about packaging, pricing strategies, quality standards, and building relationships with buyers.',
        category: 'Marketing',
        coverImage: 'https://images.unsplash.com/photo-1524594081293-190a2fe0baae?q=80&w=1600&auto=format&fit=crop',
        price: 0,
        currency: 'KES',
        isFree: true,
        lessons: [
            {
                title: 'Quality Standards',
                contentHtml: '<h2>Meeting Market Expectations</h2><p>Understand the quality standards required for different markets...</p>',
                videoUrl: 'https://example.com/video10',
                duration: '17 minutes',
                order: 1
            },
            {
                title: 'Packaging and Presentation',
                contentHtml: '<h2>Making a Good First Impression</h2><p>Learn effective packaging techniques to attract buyers...</p>',
                videoUrl: 'https://example.com/video11',
                duration: '14 minutes',
                order: 2
            },
            {
                title: 'Pricing Strategies',
                contentHtml: '<h2>Setting the Right Price</h2><p>Develop pricing strategies that ensure profitability while remaining competitive...</p>',
                videoUrl: 'https://example.com/video12',
                duration: '18 minutes',
                order: 3
            }
        ]
    },
    {
        title: 'Sustainable Farming Practices',
        slug: 'sustainable-farming-practices',
        description: 'Learn environmentally conscious farming methods that promote long-term sustainability. Discover techniques for reducing environmental impact while maintaining productivity and profitability.',
        category: 'Sustainability',
        coverImage: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1600&auto=format&fit=crop',
        price: 120,
        currency: 'KES',
        isFree: false,
        lessons: [
            {
                title: 'Principles of Sustainable Agriculture',
                contentHtml: '<h2>Building a Sustainable Future</h2><p>Understand the core principles of sustainable farming and their importance for future generations...</p>',
                videoUrl: 'https://example.com/video16',
                duration: '22 minutes',
                order: 1
            },
            {
                title: 'Conservation Tillage',
                contentHtml: '<h2>Protecting Soil Structure</h2><p>Learn about reduced tillage methods that preserve soil health and reduce erosion...</p>',
                videoUrl: 'https://example.com/video17',
                duration: '19 minutes',
                order: 2
            },
            {
                title: 'Renewable Energy on the Farm',
                contentHtml: '<h2>Powering Your Farm Sustainably</h2><p>Explore solar, wind, and other renewable energy options for agricultural operations...</p>',
                videoUrl: 'https://example.com/video18',
                duration: '24 minutes',
                order: 3
            },
            {
                title: 'Carbon Footprint Reduction',
                contentHtml: '<h2>Minimizing Environmental Impact</h2><p>Implement strategies to reduce your farm\'s carbon footprint and contribute to climate solutions...</p>',
                videoUrl: 'https://example.com/video19',
                duration: '20 minutes',
                order: 4
            }
        ]
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Use the same fallback URI as server.js
        const mongoUri = process.env.MONGO_URI || 'mongodb+srv://Muigo:lucy17@cluster0.4z7ofja.mongodb.net/farmers-lms';
        
        // Connect to MongoDB Atlas
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB Atlas');

        // Clear existing courses
        await Course.deleteMany({});
        console.log('✅ Cleared existing courses');

        // Create a default admin user if none exists
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@farmerslms.com',
                passwordHash: hashedPassword, // FIXED: Changed from 'password' to 'passwordHash'
                role: 'admin'
            });
            console.log('✅ Created admin user');
        } else {
            console.log('✅ Admin user already exists');
        }

        // Add courses with admin as creator
        for (const courseData of sampleCourses) {
            const course = new Course({
                ...courseData,
                createdBy: adminUser._id
            });
            await course.save();
            console.log(`✅ Created course: ${course.title}`);
        }

        console.log('🎉 Database seeded successfully!');
        console.log(`📚 Added ${sampleCourses.length} courses to the database`);
        console.log('🔗 You can now view courses at: http://localhost:5000/api/courses');
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
