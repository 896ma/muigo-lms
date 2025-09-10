require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_URL = `http://localhost:${process.env.PORT || 5000}`;

async function testPaymentFlow() {
    console.log('🧪 Testing Payment Flow...\n');
    
    try {
        // Test 1: Check if Paystack is configured
        console.log('1. Checking Paystack configuration...');
        if (!process.env.PAYSTACK_SECRET_KEY) {
            console.log('❌ PAYSTACK_SECRET_KEY not set in .env file');
            console.log('   Please add your Paystack secret key to backend/.env');
            return;
        }
        console.log('✅ Paystack secret key is configured');
        
        // Test 2: Check API health
        console.log('\n2. Testing API health...');
        const healthResponse = await axios.get(`${API_URL}/api/payments/health`);
        console.log('✅ Payments API is healthy:', healthResponse.data);
        
        // Test 3: Test course listing
        console.log('\n3. Testing course listing...');
        const coursesResponse = await axios.get(`${API_URL}/api/courses`);
        const courses = coursesResponse.data;
        console.log(`✅ Found ${courses.length} courses`);
        
        // Show course details
        courses.forEach(course => {
            console.log(`   - ${course.title}: ${course.isFree ? 'Free' : `Ksh ${course.price}`}`);
        });
        
        console.log('\n🎉 Payment system is ready!');
        console.log('\nNext steps:');
        console.log('1. Add your Paystack keys to backend/.env');
        console.log('2. Start the servers: npm run dev');
        console.log('3. Test payment flow in the browser');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Response:', error.response.data);
        }
    }
}

testPaymentFlow();
