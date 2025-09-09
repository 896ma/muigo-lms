require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/course');

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
        
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected to MongoDB successfully');
        
        // Test querying courses
        const courseCount = await Course.countDocuments();
        console.log(`📚 Found ${courseCount} courses in database`);
        
        if (courseCount === 0) {
            console.log('⚠️ No courses found. You may need to run: npm run seed');
        } else {
            const courses = await Course.find().select('title slug price isFree');
            console.log('📖 Courses in database:');
            courses.forEach(course => {
                console.log(`  - ${course.title} (${course.isFree ? 'Free' : `Ksh ${course.price}`})`);
            });
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
