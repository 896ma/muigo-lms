# Farmers LMS

A comprehensive Learning Management System designed specifically for farmers, featuring both free and paid courses with integrated payment processing.

## Features

- **Course Management**: Free and paid courses with detailed content
- **Payment Integration**: Paystack integration for secure payments
- **User Authentication**: JWT-based authentication system
- **Progress Tracking**: Monitor learning progress and course completion
- **Admin Dashboard**: Manage courses, users, and payments
- **Responsive Design**: Mobile-friendly interface with dark theme

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Paystack for payments
- bcryptjs for password hashing

### Frontend
- React with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Paystack account (for payments)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   - Set your MongoDB connection string
   - Add your JWT secret key
   - Configure Paystack keys (get from Paystack dashboard)

5. Seed the database with sample courses:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Browse Courses**: Visit `/courses` to see all available courses
2. **View Course Details**: Click on any course to see detailed information
3. **Enroll in Free Courses**: Free courses can be enrolled in directly
4. **Purchase Paid Courses**: Paid courses redirect to Paystack for secure payment
5. **Track Progress**: Visit `/portal` to see enrolled courses and progress
6. **Admin Access**: Use `/admin` for course and user management

## Course Structure

Each course includes:
- Title and description
- Cover image
- Price (Free or Ksh 50)
- Multiple lessons with content
- Video URLs and duration
- Progress tracking

## Payment Flow

1. User clicks "Pay & Enroll" on a paid course
2. System initializes Paystack payment
3. User is redirected to Paystack payment page
4. After successful payment, user is redirected back
5. System verifies payment and enrolls user
6. User gains access to course content

## API Endpoints

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:slug` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in free course

### Payments
- `POST /api/payments/initialize` - Initialize Paystack payment
- `POST /api/payments/verify` - Verify payment and enroll user

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Environment Variables

### Backend (.env)
```
