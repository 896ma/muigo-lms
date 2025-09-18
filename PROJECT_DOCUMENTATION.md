# Farmers LMS - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Environment Configuration](#environment-configuration)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Payment Integration](#payment-integration)
9. [Authentication System](#authentication-system)
10. [Course Management](#course-management)
11. [Deployment Guide](#deployment-guide)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Farmers LMS** is a comprehensive Learning Management System designed specifically for farmers to access agricultural courses, track their learning progress, and manage their educational journey. The platform supports both free and paid courses with integrated M-Pesa payment processing through Paystack.

### Key Features
- **User Authentication**: Registration and login system
- **Course Management**: Free and paid agricultural courses
- **Payment Processing**: M-Pesa integration via Paystack
- **Progress Tracking**: Enrollment and course completion tracking
- **Admin Dashboard**: Course and user management
- **Responsive Design**: Mobile-friendly interface

---

## 🛠 Technology Stack

### Backend
- **Node.js** (v22.16.0)
- **Express.js** - Web framework
- **MongoDB** - Database (Atlas cloud)
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Axios** - HTTP client for API calls
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables

### Frontend
- **React** (v18.2.0)
- **Vite** (v7.1.4) - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client

### Payment Integration
- **Paystack** - Payment gateway
- **M-Pesa** - Mobile money integration

### Development Tools
- **Nodemon** - Backend development
- **Concurrently** - Run multiple processes
- **Git** - Version control

---

## 📁 Project Structure

```
farmers-lms/
├── backend/
│   ├── config/
│   │   └── config.js
│   ├── controllers/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── course.js
│   │   ├── user.js
│   │   ├── payment.js
│   │   └── Enrollment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── payments.js
│   │   ├── enrollments.js
│   │   └── admin.js
│   ├── server.js
│   ├── seed.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CourseDetail.jsx
│   │   │   ├── PaymentCallback.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── Tabs.jsx
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── public/
│   └── package.json
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables (.env)
```env
# Database Configuration
MONGO_URI=mongodb+srv://Muigo:lucy17@cluster0.4z7ofja.mongodb.net/farmers-lms?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=5000
JWT_SECRET=dev_secret_change_me_in_production
FRONTEND_URL=http://localhost:5173

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_a8a3c5253cdd0c91a90ceac371cfaea2f6bdeeb5
PAYSTACK_PUBLIC_KEY=pk_live_35a44b788e258576c74da0b84e4b9b75250ed203
PAYSTACK_CALLBACK_URL=http://localhost:5173/payment-callback
```

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:5000
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  phone: String,
  farmLocation: String,
  role: String (default: 'farmer'),
  createdAt: Date
}
```

### Course Model
```javascript
{
  title: String (required),
  slug: String (unique, indexed),
  description: String,
  category: String,
  coverImage: String,
  price: Number (default: 0),
  currency: String (default: 'KES'),
  isFree: Boolean (default: false),
  lessons: [{
    title: String,
    contentHtml: String,
    videoUrl: String,
    duration: String,
    order: Number
  }],
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date
}
```

### Payment Model
```javascript
{
  user: ObjectId (ref: 'User'),
  course: ObjectId (ref: 'Course'),
  amount: Number,
  currency: String,
  provider: String,
  reference: String,
  status: String,
  metadata: Mixed,
  createdAt: Date
}
```

### Enrollment Model
```javascript
{
  user: ObjectId (ref: 'User'),
  course: ObjectId (ref: 'Course'),
  enrolledAt: Date,
  progress: Number (default: 0),
  completed: Boolean (default: false)
}
```

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login

### Course Routes (`/api/courses`)
- `GET /` - Get all courses
- `GET /:slug` - Get course by slug

### Payment Routes (`/api/payments`)
- `POST /initiate` - Initiate general payment
- `POST /initiate-mpesa` - Initiate M-Pesa payment
- `GET /verify/:reference` - Verify payment
- `POST /webhook` - Paystack webhook

### Enrollment Routes (`/api/enrollments`)
- `GET /me` - Get user enrollments
- `POST /` - Create enrollment

### Admin Routes (`/api/admin`)
- `GET /stats` - Get admin statistics
- `GET /users` - Get all users
- `GET /enrollments` - Get all enrollments

---

## 🎨 Frontend Components

### Main Components

#### 1. App Layout (`main.jsx`)
- **Purpose**: Main application container
- **Features**: 
  - Navigation bar
  - Authentication state management
  - Route handling
  - Payment processing

#### 2. Course Detail (`CourseDetail.jsx`)
- **Purpose**: Display individual course information
- **Features**:
  - Course information display
  - Enrollment/payment buttons
  - Lesson access
  - Progress tracking

#### 3. Payment Callback (`PaymentCallback.jsx`)
- **Purpose**: Handle payment verification after redirect
- **Features**:
  - Payment status verification
  - Success/error handling
  - Automatic redirect to portal

#### 4. Authentication Components
- **Login Form**: User authentication
- **Registration Form**: New user signup
- **Auth State Management**: Token handling

### Styling
- **Framework**: Tailwind CSS
- **Design**: Modern, responsive design
- **Color Scheme**: Green-based agricultural theme
- **Mobile-First**: Responsive design for all devices

---

## 💳 Payment Integration

### Paystack Configuration

#### 1. API Keys
```javascript
// Live Keys (Production)
PAYSTACK_SECRET_KEY=sk_live_a8a3c5253cdd0c91a90ceac371cfaea2f6bdeeb5
PAYSTACK_PUBLIC_KEY=pk_live_35a44b788e258576c74da0b84e4b9b75250ed203

// Test Keys (Development)
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
```

#### 2. Payment Flow
1. **Initiation**: User clicks "Pay with M-Pesa"
2. **API Call**: Frontend calls `/api/payments/initiate-mpesa`
3. **Paystack**: Backend creates payment with Paystack API
4. **Redirect**: User redirected to Paystack payment page
5. **Payment**: User completes M-Pesa payment
6. **Callback**: Paystack redirects to `/payment-callback`
7. **Verification**: Frontend verifies payment with backend
8. **Enrollment**: User enrolled in course upon success

#### 3. M-Pesa Integration
```javascript
// Payment payload for M-Pesa
{
  email: user.email,
  amount: amountInKobo,
  callback_url: process.env.PAYSTACK_CALLBACK_URL,
  metadata: {
    userId: user.id,
    courseId: course.id,
    phoneNumber: phoneNumber,
    paymentMethod: 'mpesa'
  },
  channels: ['mobile_money'],
  mobile_money: {
    phone: phoneNumber
  }
}
```

---

## 🔐 Authentication System

### JWT Implementation
```javascript
// Token Generation
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Token Verification Middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.user = { id: payload.id, role: payload.role };
  next();
};
```

### User Roles
- **Farmer**: Default role, can enroll in courses
- **Admin**: Can manage courses and users

---

## 📚 Course Management

### Course Structure
```javascript
// Sample Course Data
{
  title: 'Irrigation 101',
  slug: 'irrigation-101',
  description: 'Master efficient irrigation techniques...',
  category: 'Water Management',
  coverImage: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1600&auto=format&fit=crop',
  price: 18,
  currency: 'KES',
  isFree: false,
  lessons: [
    {
      title: 'Understanding Water Needs',
      contentHtml: '<h2>Plant Water Requirements</h2>...',
      videoUrl: 'https://example.com/video1',
      duration: '18 minutes',
      order: 1
    }
  ]
}
```

### Course Pricing
- **Free Courses**: Soil Health Basics, Market Readiness
- **Paid Courses**: 
  - Irrigation 101: Ksh 18 (highest)
  - Organic Pest Control: Ksh 15
  - Advanced Crop Management: Ksh 12
  - Sustainable Farming Practices: Ksh 10

---

## 🖼️ Image Sources

### Course Cover Images
All course cover images are sourced from **Unsplash** with specific parameters:

```javascript
// Image URL Structure
https://images.unsplash.com/photo-[ID]?q=80&w=1600&auto=format&fit=crop

// Examples:
// Soil Health: https://images.unsplash.com/photo-1500382017468-9049fed747ef
// Irrigation: https://images.unsplash.com/photo-1508804185872-d7badad00f7d
// Pest Control: https://images.unsplash.com/photo-1471193945509-9ad0617afabf
// Market Readiness: https://images.unsplash.com/photo-1524594081293-190a2fe0baae
// Sustainability: https://images.unsplash.com/photo-1574943320219-553eb213f72d
```

### Image Optimization
- **Width**: 1600px
- **Quality**: 80%
- **Format**: Auto (WebP when supported)
- **Crop**: Smart crop for consistent aspect ratios

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Paystack account
- Git

### Local Development Setup

1. **Clone Repository**
```bash
git clone https://github.com/896ma/muigo-lms.git
cd farmers-lms
```

2. **Install Dependencies**
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install
```

3. **Environment Setup**
```bash
# Create .env file in root directory
cp .env.example .env

# Edit .env with your configuration
nano .env
```

4. **Database Setup**
```bash
# Seed the database
cd backend && node seed.js
```

5. **Start Development Server**
```bash
# From root directory
npm run dev
```

### Production Deployment

1. **Environment Variables**
   - Set production MongoDB URI
   - Use live Paystack keys
   - Set production frontend URL

2. **Build Frontend**
```bash
cd frontend
npm run build
```

3. **Start Production Server**
```bash
cd backend
npm start
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Issues
```bash
# Error: "Server record does not share hostname with parent URI"
# Solution: Remove deprecated connection options
mongoose.connect(mongoUri); // Remove useNewUrlParser, useUnifiedTopology
```

#### 2. Payment Verification Failures
```bash
# Error: "Payment verification failed"
# Solution: Check API endpoint and authentication
# Ensure using GET /api/payments/verify/:reference with auth header
```

#### 3. Port Conflicts
```bash
# Error: "Port 5173 is in use"
# Solution: Update .env file with correct port
FRONTEND_URL=http://localhost:5174
PAYSTACK_CALLBACK_URL=http://localhost:5174/payment-callback
```

#### 4. Authentication Issues
```bash
# Error: "Unauthorized"
# Solution: Check token in localStorage and JWT secret
# Ensure user is logged in before making payment requests
```

### Debug Mode
```bash
# Enable detailed logging
NODE_ENV=development npm run dev

# Check backend logs
tail -f backend/logs/app.log

# Check frontend console
# Open browser DevTools > Console
```

---

## 📊 Performance Optimization

### Backend Optimizations
- **Database Indexing**: Course slug, user email
- **Connection Pooling**: MongoDB connection reuse
- **Error Handling**: Comprehensive error responses
- **Logging**: Structured logging for debugging

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed images from Unsplash
- **Caching**: LocalStorage for authentication
- **Responsive Design**: Mobile-first approach

---

## 🔒 Security Considerations

### Data Protection
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Security**: Secure secret keys
- **Input Validation**: Server-side validation
- **CORS Configuration**: Restricted origins

### Payment Security
- **HTTPS Only**: All payment communications encrypted
- **Webhook Verification**: Paystack signature validation
- **Token Expiration**: 7-day JWT expiry
- **Environment Variables**: Sensitive data in .env

---

## 📈 Future Enhancements

### Planned Features
1. **Video Streaming**: Integrated video player
2. **Progress Tracking**: Detailed learning analytics
3. **Certificates**: Course completion certificates
4. **Mobile App**: React Native application
5. **Offline Mode**: PWA capabilities
6. **Multi-language**: Localization support

### Technical Improvements
1. **Microservices**: Split into smaller services
2. **Redis Caching**: Improve performance
3. **CDN**: Global content delivery
4. **Monitoring**: Application performance monitoring
5. **Testing**: Comprehensive test suite

---

## 📞 Support & Contact

### Development Team
- **Lead Developer**: Muigo
- **Repository**: https://github.com/896ma/muigo-lms
- **Email**: [Contact through GitHub]

### Documentation Updates
This documentation is maintained alongside the codebase. For updates or corrections, please create an issue or pull request in the repository.

---

## 📄 License

This project is proprietary software. All rights reserved.

---

*Last Updated: January 2025*
*Version: 1.0.0*

