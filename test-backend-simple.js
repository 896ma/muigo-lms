// Simple test to check if backend is running
console.log('Testing backend connection...');

fetch('http://localhost:5000/health')
    .then(response => response.json())
    .then(data => {
        console.log('Health check successful:', data);
        return fetch('http://localhost:5000/api/courses');
    })
    .then(response => {
        console.log('Courses endpoint status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Courses data:', data);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });


