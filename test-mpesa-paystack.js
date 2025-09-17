const axios = require('axios');

async function testMpesaPaystack() {
    try {
        console.log('🧪 Testing M-Pesa through Paystack...\n');
        
        // Load environment variables
        require('dotenv').config({ path: './.env' });
        
        console.log('Environment variables:');
        console.log('  PAYSTACK_SECRET_KEY:', process.env.PAYSTACK_SECRET_KEY ? 'Set ✅' : 'Not set ❌');
        console.log('  PAYSTACK_CALLBACK_URL:', process.env.PAYSTACK_CALLBACK_URL || 'Not set ❌');
        console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set ❌');
        
        // Test courses endpoint
        console.log('\n1. Testing courses endpoint...');
        const coursesResponse = await axios.get('http://localhost:5000/api/courses');
        console.log('✅ Courses endpoint working');
        console.log(`   Found ${coursesResponse.data.length} courses`);
        
        // Test M-Pesa payment initiation (will fail without auth, but we can see the error)
        console.log('\n2. Testing M-Pesa payment initiation...');
        try {
            const mpesaResponse = await axios.post('http://localhost:5000/api/payments/initiate-mpesa', {
                courseId: '68c3a32c265df67e6e049c04', // Irrigation 101 course
                phoneNumber: '254712345678'
            });
            console.log('✅ M-Pesa payment initiation successful');
            console.log('   Authorization URL:', mpesaResponse.data.authorization_url);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('⚠️  M-Pesa payment initiation requires authentication (expected)');
                console.log('   Error:', error.response.data.message);
            } else {
                console.log('❌ M-Pesa payment initiation failed:', error.response?.data || error.message);
            }
        }
        
        // Test regular Paystack payment initiation
        console.log('\n3. Testing regular Paystack payment initiation...');
        try {
            const paystackResponse = await axios.post('http://localhost:5000/api/payments/initiate', {
                courseId: '68c3a32c265df67e6e049c04'
            });
            console.log('✅ Paystack payment initiation successful');
            console.log('   Authorization URL:', paystackResponse.data.authorization_url);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('⚠️  Paystack payment initiation requires authentication (expected)');
                console.log('   Error:', error.response.data.message);
            } else {
                console.log('❌ Paystack payment initiation failed:', error.response?.data || error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testMpesaPaystack();
