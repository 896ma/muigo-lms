# 🔌 Farmers LMS - API Documentation

## 📋 Base URL
```
Development: http://localhost:5000
Production: https://yourdomain.com
```

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 👤 Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "254712345678",
  "farmLocation": "Nairobi, Kenya"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68c98eca2f7b69239c08ab0d",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "farmer"
  }
}
```

**Status Codes:**
- `201` - Registration successful
- `400` - Validation error or email already exists
- `500` - Server error

---

### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68c98eca2f7b69239c08ab0d",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "farmer"
  }
}
```

**Status Codes:**
- `200` - Login successful
- `400` - Invalid credentials
- `500` - Server error

---

## 📚 Course Endpoints

### GET /api/courses
Get all available courses.

**Query Parameters:**
- `category` (optional) - Filter by category
- `isFree` (optional) - Filter by free/paid courses

**Response:**
```json
{
  "courses": [
    {
      "_id": "68ca7cb3528adba06af4d886",
      "title": "Irrigation 101",
      "slug": "irrigation-101",
      "description": "Master efficient irrigation techniques...",
      "category": "Water Management",
      "coverImage": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d",
      "price": 18,
      "currency": "KES",
      "isFree": false,
      "lessons": [
        {
          "title": "Understanding Water Needs",
          "contentHtml": "<h2>Plant Water Requirements</h2>...",
          "videoUrl": "https://example.com/video1",
          "duration": "18 minutes",
          "order": 1
        }
      ],
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### GET /api/courses/:slug
Get a specific course by slug.

**Path Parameters:**
- `slug` - Course slug (e.g., "irrigation-101")

**Response:**
```json
{
  "course": {
    "_id": "68ca7cb3528adba06af4d886",
    "title": "Irrigation 101",
    "slug": "irrigation-101",
    "description": "Master efficient irrigation techniques...",
    "category": "Water Management",
    "coverImage": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d",
    "price": 18,
    "currency": "KES",
    "isFree": false,
    "lessons": [...],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Course not found
- `500` - Server error

---

## 💳 Payment Endpoints

### POST /api/payments/initiate
Initiate a general payment (not M-Pesa specific).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "68ca7cb3528adba06af4d886"
}
```

**Response:**
```json
{
  "authorization_url": "https://checkout.paystack.com/abc123",
  "reference": "ref_123456789"
}
```

**Status Codes:**
- `200` - Payment initiated successfully
- `401` - Unauthorized
- `404` - Course not found
- `500` - Server error

---

### POST /api/payments/initiate-mpesa
Initiate M-Pesa payment through Paystack.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "68ca7cb3528adba06af4d886",
  "phoneNumber": "254712345678"
}
```

**Response:**
```json
{
  "authorization_url": "https://checkout.paystack.com/abc123",
  "reference": "ref_123456789"
}
```

**Status Codes:**
- `200` - M-Pesa payment initiated successfully
- `401` - Unauthorized
- `404` - Course not found
- `500` - Server error

---

### GET /api/payments/verify/:reference
Verify payment status and complete enrollment.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `reference` - Payment reference from Paystack

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and enrollment completed"
}
```

**Status Codes:**
- `200` - Payment verified successfully
- `400` - Payment not successful
- `401` - Unauthorized
- `500` - Server error

---

### POST /api/payments/webhook
Paystack webhook endpoint for payment notifications.

**Headers:**
```
x-paystack-signature: <paystack_signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "ref_123456789",
    "status": "success",
    "amount": 1800,
    "customer": {
      "email": "john@example.com"
    }
  }
}
```

**Response:**
```json
{
  "status": "ok"
}
```

**Status Codes:**
- `200` - Webhook processed successfully
- `400` - Invalid webhook data
- `500` - Server error

---

## 📖 Enrollment Endpoints

### GET /api/enrollments/me
Get current user's enrollments.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "enrollments": [
    {
      "_id": "68ca7cb4528adba06af4d890",
      "user": "68c98eca2f7b69239c08ab0d",
      "course": {
        "_id": "68ca7cb3528adba06af4d886",
        "title": "Irrigation 101",
        "slug": "irrigation-101",
        "price": 18,
        "currency": "KES"
      },
      "enrolledAt": "2025-01-01T00:00:00.000Z",
      "progress": 0,
      "completed": false
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### POST /api/enrollments
Create a new enrollment (usually done automatically after payment).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "68ca7cb3528adba06af4d886"
}
```

**Response:**
```json
{
  "enrollment": {
    "_id": "68ca7cb4528adba06af4d890",
    "user": "68c98eca2f7b69239c08ab0d",
    "course": "68ca7cb3528adba06af4d886",
    "enrolledAt": "2025-01-01T00:00:00.000Z",
    "progress": 0,
    "completed": false
  }
}
```

**Status Codes:**
- `201` - Enrollment created successfully
- `400` - Already enrolled or validation error
- `401` - Unauthorized
- `404` - Course not found
- `500` - Server error

---

## 👨‍💼 Admin Endpoints

### GET /api/admin/stats
Get admin dashboard statistics.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "totalCourses": 6,
  "totalUsers": 150,
  "totalEnrollments": 89,
  "activeUsers": 45,
  "recentEnrollments": [
    {
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "course": {
        "title": "Irrigation 101",
        "price": 18
      },
      "enrolledAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `500` - Server error

---

### GET /api/admin/users
Get all users (admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "users": [
    {
      "_id": "68c98eca2f7b69239c08ab0d",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "254712345678",
      "farmLocation": "Nairobi, Kenya",
      "role": "farmer",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `500` - Server error

---

### GET /api/admin/enrollments
Get all enrollments (admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "enrollments": [
    {
      "_id": "68ca7cb4528adba06af4d890",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "course": {
        "title": "Irrigation 101",
        "price": 18
      },
      "enrolledAt": "2025-01-01T00:00:00.000Z",
      "progress": 0,
      "completed": false
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `500` - Server error

---

## 🔍 Error Responses

### Standard Error Format
```json
{
  "message": "Error description",
  "error": "Detailed error information",
  "status": "error"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid input data |
| `401` | Unauthorized - Missing or invalid token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource not found |
| `409` | Conflict - Resource already exists |
| `422` | Unprocessable Entity - Validation error |
| `500` | Internal Server Error - Server error |

### Validation Errors
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

---

## 🔐 Authentication Flow

### 1. User Registration
```javascript
// 1. POST /api/auth/register
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '254712345678',
    farmLocation: 'Nairobi, Kenya'
  })
});

// 2. Store token
const { token, user } = await response.json();
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
```

### 2. User Login
```javascript
// 1. POST /api/auth/login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

// 2. Store token
const { token, user } = await response.json();
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
```

### 3. Making Authenticated Requests
```javascript
// Include token in headers
const token = localStorage.getItem('token');
const response = await fetch('/api/enrollments/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 💳 Payment Flow

### 1. Initiate M-Pesa Payment
```javascript
// 1. POST /api/payments/initiate-mpesa
const response = await fetch('/api/payments/initiate-mpesa', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    courseId: '68ca7cb3528adba06af4d886',
    phoneNumber: '254712345678'
  })
});

// 2. Redirect to Paystack
const { authorization_url, reference } = await response.json();
window.location.href = authorization_url;
```

### 2. Payment Verification
```javascript
// After redirect from Paystack
const urlParams = new URLSearchParams(window.location.search);
const reference = urlParams.get('reference');

// Verify payment
const response = await fetch(`/api/payments/verify/${reference}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { success, message } = await response.json();
if (success) {
  // Payment successful, user enrolled
  console.log(message);
}
```

---

## 📊 Rate Limiting

### Current Limits
- **Authentication**: 5 requests per minute per IP
- **API Calls**: 100 requests per hour per user
- **Payment**: 10 requests per hour per user

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔧 Testing

### Test Endpoints
```bash
# Health check
curl http://localhost:5000/api/courses

# Authentication test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Payment test (with token)
curl -X POST http://localhost:5000/api/payments/initiate-mpesa \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId":"COURSE_ID","phoneNumber":"254712345678"}'
```

### Postman Collection
Import the following collection for API testing:
```json
{
  "info": {
    "name": "Farmers LMS API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\",\n  \"phone\": \"254712345678\",\n  \"farmLocation\": \"Nairobi, Kenya\"\n}"
            },
            "url": "{{base_url}}/api/auth/register"
          }
        }
      ]
    }
  ]
}
```

---

## 📈 Monitoring

### Health Check Endpoint
```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "version": "1.0.0"
}
```

### Metrics Endpoint (Admin Only)
```
GET /api/admin/metrics
```

**Response:**
```json
{
  "totalRequests": 1500,
  "activeUsers": 45,
  "averageResponseTime": 120,
  "errorRate": 0.02,
  "uptime": 99.9
}
```

---

**API Documentation Version: 1.0.0**  
**Last Updated: January 2025**

