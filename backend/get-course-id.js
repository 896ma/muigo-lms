const mongoose = require('mongoose');
const Course = require('./models/course');

async function getCourseId() {
    try {
        await mongoose.connect('mongodb+srv://Muigo:lucy17@cluster0.4z7ofja.mongodb.net/farmers-lms');
        console.log('Connected to MongoDB');
        
        const courses = await Course.find({ price: { $gt: 0 } });
        console.log('Paid courses:');
        courses.forEach(course => {
            console.log(`ID: ${course._id}, Title: ${course.title}, Price: ${course.price}`);
        });
        
        if (courses.length > 0) {
            console.log(`\nUse this course ID for testing: ${courses[0]._id}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

getCourseId();
