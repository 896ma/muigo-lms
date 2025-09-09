#!/bin/bash

echo "Setting up Farmers LMS..."

# Install concurrently globally if not already installed
if ! command -v concurrently &> /dev/null; then
    echo "Installing concurrently globally..."
    npm install -g concurrently
fi

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create .env file for backend if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "Creating backend .env file..."
    cat > backend/.env << EOF
MONGO_URI=mongodb+srv://Muigo:lucy17@cluster0.4z7ofja.mongodb.net/farmerslms
JWT_SECRET=your_jwt_secret_key_here_change_me
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
PORT=5000
FRONTEND_URL=http://localhost:5173
EOF
    echo "Created backend .env file"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start both frontend and backend"
echo "  npm run backend      - Start only backend"
echo "  npm run frontend     - Start only frontend"
echo "  npm run seed         - Seed the database"
echo "  npm run setup        - Full setup (install + seed)"
echo ""
