const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testAPI() {
    try {
        console.log('Testing API connection...');
        
        // Test health endpoint
        const healthResponse = await axios.get(`${API_BASE}/health`);
        console.log('✅ Health check:', healthResponse.data);
        
        // Test courses test endpoint
        const testResponse = await axios.get(`${API_BASE}/api/courses/test`);
        console.log('✅ Courses test:', testResponse.data);
        
        // Test courses endpoint
        const coursesResponse = await axios.get(`${API_BASE}/api/courses`);
        console.log('✅ Courses count:', coursesResponse.data.length);
        console.log('✅ First course:', coursesResponse.data[0]);
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testAPI();
