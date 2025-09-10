# Paystack Setup Guide

## 1. Get Paystack API Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Sign up or log in to your account
3. Go to Settings > API Keys & Webhooks
4. Copy your **Test Secret Key** (starts with `sk_test_`)
5. Copy your **Test Public Key** (starts with `pk_test_`)

## 2. Configure Environment Variables

Create or update `backend/.env` file with your Paystack keys:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
```

## 3. Test the Payment Flow

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to a paid course and test the payment flow

## 4. Production Setup

For production:

1. Get your **Live Secret Key** and **Live Public Key** from Paystack
2. Update the environment variables
3. Configure webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Test with real payments

## 5. Webhook Configuration

In Paystack Dashboard:
1. Go to Settings > API Keys & Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: `charge.success`
4. Save the configuration

## Troubleshooting

- Make sure your Paystack keys are correct
- Check that the frontend URL is set correctly in `.env`
- Verify that the webhook URL is accessible
- Check server logs for any errors
