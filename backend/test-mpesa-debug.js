const axios = require('axios');

async function testMpesaPayment() {
    try {
        console.log('Testing M-Pesa payment initialization...');
        
        // First, get available courses
        console.log('Getting available courses...');
        const coursesResponse = await axios.get('http://localhost:5000/api/courses');
        const paidCourses = coursesResponse.data.filter(course => course.price > 0);
        
        if (paidCourses.length === 0) {
            console.error('❌ No paid courses found');
            return;
        }
        
        const course = paidCourses[0];
        console.log(`Using course: ${course.title} (ID: ${course._id}, Price: ${course.price})`);
        
        const response = await axios.post('http://localhost:5000/api/payments/initialize', {
            courseId: course._id,
            phoneNumber: '254712345678'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test_token'
            }
        });
        
        console.log('✅ Success! Response:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        if (error.response?.data) {
            console.error('Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testMpesaPayment();
