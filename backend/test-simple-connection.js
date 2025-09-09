require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing simple connection...');
console.log('📁 Current directory:', process.cwd());
console.log('🔧 MONGO_URI exists:', process.env.MONGO_URI ? 'Yes' : 'No');

if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI not found');
    console.log('💡 Make sure .env file exists in backend directory');
    process.exit(1);
}

console.log('🔗 MONGO_URI:', process.env.MONGO_URI.replace(/\/\/.*@/, '//***:***@'));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ Connected successfully!');
    mongoose.disconnect();
    process.exit(0);
})
.catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
});

