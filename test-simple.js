// Simple test to check if backend is running
const http = require('http');

function testBackend() {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/courses',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response:', data);
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error.message);
    });

    req.end();
}

console.log('Testing backend connection...');
testBackend();


