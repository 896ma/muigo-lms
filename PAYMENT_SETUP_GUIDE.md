# Payment Setup Guide for Farmers LMS

## 🎯 Overview

Your Farmers LMS supports two payment methods:
1. **Paystack** - For general payments (cards, bank transfers)
2. **Flutterwave** - For M-Pesa payments (SMS prompts)

## 🔧 Current Status

✅ **MongoDB Connection** - Fixed and working  
✅ **Authentication Middleware** - Fixed and working  
✅ **Server Configuration** - Fixed and working  
⚠️ **Payment Providers** - Need API keys configuration  

## 📋 Required API Keys

### 1. Paystack Configuration

**Get your Paystack keys:**
1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Sign up or log in
3. Go to Settings > API Keys & Webhooks
4. Copy your **Test Secret Key** (starts with `sk_test_`)
5. Copy your **Test Public Key** (starts with `pk_test_`)

**Update your `.env` file:**
```env
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
PAYSTACK_CALLBACK_URL=http://localhost:5173/payment-callback
```

### 2. Flutterwave Configuration (for M-Pesa)

**Get your Flutterwave keys:**
1. Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com/)
2. Sign up or log in
3. Go to Settings > API Keys
4. Copy your **Secret Key** (starts with `FLWSECK_TEST-`)
5. Copy your **Public Key** (starts with `FLWPUBK_TEST-`)

**Update your `.env` file:**
```env
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST_your_actual_secret_key_here
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST_your_actual_public_key_here
```

## 🚀 Testing the Payment Flow

### 1. Start the Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Test M-Pesa Payment (Flutterwave)

**API Endpoint:** `POST /api/payments/initialize`

**Request Body:**
```json
{
  "courseId": "68c3a32c265df67e6e049c04",
  "phoneNumber": "254712345678"
}
```

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### 3. Test Paystack Payment

**API Endpoint:** `POST /api/payments/initiate`

**Request Body:**
```json
{
  "courseId": "68c3a32c265df67e6e049c04"
}
```

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

## 🔍 Troubleshooting M-Pesa SMS Issues

### Common Issues and Solutions:

1. **"Cannot read properties of undefined (reading 'id')"**
   - ✅ **FIXED** - Added authentication middleware to payment routes

2. **"M-Pesa payment initialization failed"**
   - Check if Flutterwave API keys are correct
   - Verify phone number format (use 254XXXXXXXXX for Kenya)
   - Ensure you're using test keys in development

3. **"Payment verification failed"**
   - Check if the reference ID is valid
   - Verify the payment was actually completed
   - Check Flutterwave dashboard for payment status

4. **No SMS received**
   - Verify phone number is correct and in correct format
   - Check if you're using test environment (test numbers work differently)
   - Ensure Flutterwave account is properly configured for M-Pesa

## 📱 M-Pesa Test Numbers

For testing, use these Flutterwave test numbers:
- **254700000000** - Always successful
- **254700000001** - Always fails
- **254700000002** - Always pending

## 🔐 Security Notes

1. **Never commit API keys to version control**
2. **Use test keys in development**
3. **Switch to live keys only in production**
4. **Keep your secret keys secure**

## 📞 Support

If you're still having issues:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with the provided test numbers first
4. Check the Flutterwave/Paystack dashboards for transaction logs

## ✅ Next Steps

1. Add your actual API keys to the `.env` file
2. Test the payment flow with test numbers
3. Configure webhooks for production
4. Test with real phone numbers in production

---

**Current `.env` file location:** `D:\Dride_x\farmers-lms\.env`
**Server running on:** `http://localhost:5000`
**Frontend running on:** `http://localhost:5173`
