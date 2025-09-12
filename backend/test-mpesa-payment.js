const axios = require('axios');

// Test M-Pesa payment initialization
async function testMpesaPayment() {
    try {
        console.log('Testing M-Pesa payment initialization...');
        
        const response = await axios.post('http://localhost:5000/api/payments/initialize', {
            courseId: '507f1f77bcf86cd799439011', // Use a real course ID
            phoneNumber: '254712345678'
        }, {
            headers: {
                'Authorization': 'Bearer test_token', // You'll need a real token
                'Content-Type': 'application/json'
            }
        });
        
        console.log('M-Pesa payment response:', response.data);
        
        if (response.data.reference) {
            console.log('Payment reference:', response.data.reference);
            console.log('Message:', response.data.message);
        }
        
    } catch (error) {
        console.error('M-Pesa payment test error:', error.response?.data || error.message);
    }
}

// Test payment verification
async function testPaymentVerification(reference) {
    try {
        console.log('Testing payment verification...');
        
        const response = await axios.post('http://localhost:5000/api/payments/verify', {
            reference: reference
        }, {
            headers: {
                'Authorization': 'Bearer test_token',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Payment verification response:', response.data);
        
    } catch (error) {
        console.error('Payment verification test error:', error.response?.data || error.message);
    }
}

// Run tests
if (require.main === module) {
    testMpesaPayment();
}

module.exports = { testMpesaPayment, testPaymentVerification };
