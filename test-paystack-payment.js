const axios = require('axios');

async function testPaystackPayment() {
    try {
        console.log('🧪 Testing Paystack Payment Flow...\n');
        
        // First, let's test if we can get courses
        console.log('1. Testing courses endpoint...');
        const coursesResponse = await axios.get('http://localhost:5000/api/courses');
        console.log('✅ Courses endpoint working');
        console.log(`   Found ${coursesResponse.data.length} courses\n`);
        
        // Test payment initiation (this will fail without auth, but we can see the error)
        console.log('2. Testing payment initiation...');
        try {
            const paymentResponse = await axios.post('http://localhost:5000/api/payments/initiate', {
                courseId: '68c3a32c265df67e6e049c04' // Irrigation 101 course
            });
            console.log('✅ Payment initiation successful');
            console.log('   Authorization URL:', paymentResponse.data.authorization_url);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('⚠️  Payment initiation requires authentication (expected)');
                console.log('   Error:', error.response.data.message);
            } else {
                console.log('❌ Payment initiation failed:', error.response?.data || error.message);
            }
        }
        
        console.log('\n3. Environment variables check:');
        console.log('   PAYSTACK_SECRET_KEY:', process.env.PAYSTACK_SECRET_KEY ? 'Set ✅' : 'Not set ❌');
        console.log('   PAYSTACK_PUBLIC_KEY:', process.env.PAYSTACK_PUBLIC_KEY ? 'Set ✅' : 'Not set ❌');
        console.log('   PAYSTACK_CALLBACK_URL:', process.env.PAYSTACK_CALLBACK_URL || 'Not set ❌');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Load environment variables
require('dotenv').config({ path: './.env' });

testPaystackPayment();
