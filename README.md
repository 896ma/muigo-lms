# 🌾 Farmers LMS - Learning Management System

A comprehensive Learning Management System designed specifically for farmers to access agricultural courses, track their learning progress, and manage their educational journey.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/896ma/muigo-lms.git
cd farmers-lms

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Seed the database
cd backend && node seed.js

# Start development server
npm run dev
```

## 🌟 Features

- **📚 Course Management**: Free and paid agricultural courses
- **💳 M-Pesa Payments**: Integrated payment processing via Paystack
- **👤 User Authentication**: Secure registration and login
- **📊 Progress Tracking**: Monitor learning progress
- **🎯 Admin Dashboard**: Course and user management
- **📱 Responsive Design**: Mobile-friendly interface

## 🛠 Technology Stack

### Backend
- Node.js + Express.js
- MongoDB Atlas
- JWT Authentication
- Paystack API Integration

### Frontend
- React + Vite
- Tailwind CSS
- React Router
- Axios

## 📖 Documentation

For complete documentation, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

## 🔧 Configuration

### Environment Variables
```env
MONGO_URI=your_mongodb_connection_string
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

## 🎯 Course Pricing

| Course | Price | Status |
|--------|-------|--------|
| Irrigation 101 | Ksh 18 | Paid |
| Organic Pest Control | Ksh 15 | Paid |
| Advanced Crop Management | Ksh 12 | Paid |
| Sustainable Farming Practices | Ksh 10 | Paid |
| Soil Health Basics | Free | Free |
| Market Readiness | Free | Free |

## 🔐 Authentication

- **Registration**: Create new farmer accounts
- **Login**: Secure JWT-based authentication
- **Roles**: Farmer and Admin roles
- **Session**: 7-day token expiration

## 💳 Payment Integration

- **Provider**: Paystack
- **Method**: M-Pesa Mobile Money
- **Flow**: Redirect-based payment processing
- **Verification**: Automatic payment verification

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:slug` - Get course by slug

### Payments
- `POST /api/payments/initiate-mpesa` - Initiate M-Pesa payment
- `GET /api/payments/verify/:reference` - Verify payment

### Enrollments
- `GET /api/enrollments/me` - Get user enrollments
- `POST /api/enrollments` - Create enrollment

## 🗄️ Database Schema

### Users
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  phone: String,
  farmLocation: String,
  role: String (default: 'farmer')
}
```

### Courses
```javascript
{
  title: String,
  slug: String (unique),
  description: String,
  price: Number,
  currency: String (default: 'KES'),
  isFree: Boolean,
  lessons: [LessonSchema]
}
```

## 🚀 Deployment

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Paystack account

### Production Setup
1. Set production environment variables
2. Build frontend: `npm run build`
3. Start backend: `npm start`
4. Configure reverse proxy (nginx/apache)

## 🔧 Development

### Available Scripts
   ```bash
npm run dev          # Start development server
npm run dev:backend  # Start backend only
npm run dev:frontend # Start frontend only
npm run build        # Build for production
```

### Project Structure
```
farmers-lms/
├── backend/          # Express.js API
├── frontend/         # React application
├── .env             # Environment variables
└── package.json     # Root dependencies
```

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection**: Check connection string and network access
2. **Payment Failures**: Verify Paystack keys and callback URLs
3. **Authentication**: Ensure JWT secret is set correctly
4. **Port Conflicts**: Update .env with correct ports

### Debug Mode
   ```bash
NODE_ENV=development npm run dev
```

## 📊 Performance

- **Database**: MongoDB Atlas with connection pooling
- **Caching**: LocalStorage for authentication
- **Images**: Optimized Unsplash images
- **Responsive**: Mobile-first design

## 🔒 Security

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Security**: Secure secret keys
- **Input Validation**: Server-side validation
- **HTTPS**: All payment communications encrypted

## 📈 Roadmap

- [ ] Video streaming integration
- [ ] Progress analytics
- [ ] Course certificates
- [ ] Mobile app (React Native)
- [ ] Offline mode (PWA)
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support or questions:
- Create an issue in the repository
- Contact through GitHub

---

**Built with ❤️ for farmers and agricultural education**