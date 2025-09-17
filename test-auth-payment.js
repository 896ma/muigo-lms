const axios = require('axios');

async function testAuthAndPayment() {
    try {
        console.log('🧪 Testing Authentication and M-Pesa Payment...\n');
        
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
        
        try {
            const registerResponse = await axios.post('http://localhost:5000/api/auth/register', registerData);
            console.log('✅ User registered successfully');
            console.log('   Token:', registerResponse.data.token ? 'Present' : 'Missing');
            console.log('   User ID:', registerResponse.data.user?._id);
            
            const token = registerResponse.data.token;
            
            // Step 2: Test M-Pesa payment with authentication
            console.log('\n2. Testing M-Pesa payment with authentication...');
            const paymentData = {
                courseId: '68c3a32c265df67e6e049c04', // Irrigation 101 course
                phoneNumber: '254712345678'
            };
            
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
            if (error.response?.status === 409) {
                console.log('⚠️  User already exists, trying to login...');
                
                // Try to login instead
                const loginData = {
                    email: 'test@example.com',
                    password: 'password123'
                };
                
                const loginResponse = await axios.post('http://localhost:5000/api/auth/login', loginData);
                console.log('✅ User logged in successfully');
                console.log('   Token:', loginResponse.data.token ? 'Present' : 'Missing');
                
                const token = loginResponse.data.token;
                
                // Test M-Pesa payment
                console.log('\n2. Testing M-Pesa payment with authentication...');
                const paymentData = {
                    courseId: '68c3a32c265df67e6e049c04',
                    phoneNumber: '254712345678'
                };
                
                const paymentResponse = await axios.post('http://localhost:5000/api/payments/initiate-mpesa', paymentData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('✅ M-Pesa payment initiated successfully');
                console.log('   Authorization URL:', paymentResponse.data.authorization_url);
                console.log('   Reference:', paymentResponse.data.reference);
                
            } else {
                console.log('❌ Registration failed:', error.response?.data || error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testAuthAndPayment();
