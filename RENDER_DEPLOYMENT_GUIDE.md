# Render Deployment Guide

## Backend Deployment on Render

### 1. Environment Variables Required

Set these in your Render dashboard under Environment Variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://Muigo:lucymuigo17@cluster0.4z7ofja.mongodb.net/farmers-lms?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secure_jwt_secret_here_change_in_production
FRONTEND_URL=https://your-vercel-app.vercel.app
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
PAYSTACK_CALLBACK_URL=https://muigo-farmers-lms.onrender.com/api/payments/webhook
```

### 2. Render Service Configuration

- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: Leave empty (or set to root of your repo)

### 3. Health Check

Your backend should respond to:
- `https://muigo-farmers-lms.onrender.com/health`
- `https://muigo-farmers-lms.onrender.com/`

### 4. Troubleshooting

If you get 502 errors:

1. **Check Render logs** for error messages
2. **Verify environment variables** are set correctly
3. **Check MongoDB connection** - make sure the URI is correct
4. **Verify the start command** is correct

### 5. Testing

Test your backend with:
```bash
curl https://muigo-farmers-lms.onrender.com/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2025-09-18T...",
  "uptime": 123.45,
  "environment": "production"
}
```

## Frontend Deployment on Vercel

### 1. Environment Variables

Set in Vercel dashboard:
```env
VITE_API_URL=https://muigo-farmers-lms.onrender.com
```

### 2. Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Testing

After deployment, test:
1. Visit your Vercel URL
2. Check browser console for API calls
3. Verify courses load from Render backend
