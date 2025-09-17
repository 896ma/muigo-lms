# Farmers LMS — Backend

## Setup
1. cp .env.example .env and set env vars
2. npm install
3. npm run dev

## Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/courses
- POST /api/payments/initiate (auth)
- POST /api/payments/webhook (paystack webhook)
- GET /api/payments/verify/:reference
