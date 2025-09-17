const axios = require('axios');

async function testAuthDebug() {
    try {
        console.log('🧪 Testing Authentication Debug...\n');
        
        // Load environment variables
        require('dotenv').config({ path: '../.env' });
        
        // Step 1: Register a test user
        console.log('1. Registering test user...');
        const registerData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            phone: '254712345678',
            farmLocation: 'Nairobi'
        };
        
        let token;
        try {
            const registerResponse = await axios.post('http://localhost:5000/api/auth/register', registerData);
            console.log('✅ User registered successfully');
            token = registerResponse.data.token;
            console.log('   Token length:', token ? token.length : 0);
            console.log('   Token preview:', token ? token.substring(0, 20) + '...' : 'None');
        } catch (error) {
            if (error.response?.status === 400 && error.response.data.message === 'Email exists') {
                console.log('⚠️  User already exists, trying to login...');
                
                const loginData = {
                    email: 'test@example.com',
                    password: 'password123'
                };
                
                const loginResponse = await axios.post('http://localhost:5000/api/auth/login', loginData);
                console.log('✅ User logged in successfully');
                token = loginResponse.data.token;
                console.log('   Token length:', token ? token.length : 0);
                console.log('   Token preview:', token ? token.substring(0, 20) + '...' : 'None');
            } else {
                console.log('❌ Registration failed:', error.response?.data || error.message);
                return;
            }
        }
        
        if (!token) {
            console.log('❌ No token received');
            return;
        }
        
        // Step 2: Test M-Pesa payment with authentication
        console.log('\n2. Testing M-Pesa payment with authentication...');
        const paymentData = {
            courseId: '68c3a32c265df67e6e049c04', // Irrigation 101 course
            phoneNumber: '254712345678'
        };
        
        console.log('   Sending request with headers:');
        console.log('   Authorization: Bearer', token.substring(0, 20) + '...');
        console.log('   Content-Type: application/json');
        
        const paymentResponse = await axios.post('http://localhost:5000/api/payments/initiate-mpesa', paymentData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ M-Pesa payment initiated successfully');
        console.log('   Authorization URL:', paymentResponse.data.authorization_url);
        console.log('   Reference:', paymentResponse.data.reference);
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('🔍 This is the Unauthorized error you mentioned!');
        }
    }
}

testAuthDebug();
