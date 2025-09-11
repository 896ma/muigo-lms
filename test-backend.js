const fetch = require('node-fetch');

async function testBackend() {
    try {
        console.log('Testing backend connection...');
        
        // Test health endpoint
        const healthResponse = await fetch('http://localhost:5000/health');
        console.log('Health check status:', healthResponse.status);
        const healthData = await healthResponse.json();
        console.log('Health check response:', healthData);
        
        // Test courses endpoint
        const coursesResponse = await fetch('http://localhost:5000/api/courses');
        console.log('Courses endpoint status:', coursesResponse.status);
        
        if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            console.log('Courses data:', coursesData);
        } else {
            const errorText = await coursesResponse.text();
            console.log('Courses error:', errorText);
        }
        
    } catch (error) {
        console.error('Backend test failed:', error.message);
    }
}

testBackend();

