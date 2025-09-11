const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@farmerslms.com' });
        if (existingAdmin) {
            console.log('❌ Admin user already exists!');
            console.log('Email: admin@farmerslms.com');
            console.log('Password: admin123');
            process.exit(0);
        }

        // Create admin user
        const passwordHash = await bcrypt.hash('admin123', 12);
        const admin = new User({
            name: 'System Administrator',
            email: 'admin@farmerslms.com',
            passwordHash: passwordHash,
            phone: '+254700000000',
            farmLocation: 'Nairobi, Kenya',
            role: 'admin'
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@farmerslms.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Role: admin');
        console.log('');
        console.log('You can now login to the admin portal using these credentials.');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

createAdmin();

