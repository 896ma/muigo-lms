@echo off
echo Setting up Farmers LMS...

REM Install concurrently globally if not already installed
npm list -g concurrently >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing concurrently globally...
    npm install -g concurrently
)

REM Install root dependencies
echo Installing root dependencies...
call npm install

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
cd ..

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Create .env file for backend if it doesn't exist
if not exist backend\.env (
    echo Creating backend .env file...
    (
        echo MONGO_URI=mongodb+srv://Muigo:lucy17@cluster0.4z7ofja.mongodb.net/farmerslms
        echo JWT_SECRET=your_jwt_secret_key_here_change_me
        echo PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
        echo PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
        echo PORT=5000
        echo FRONTEND_URL=http://localhost:5173
    ) > backend\.env
    echo Created backend .env file
)

echo.
echo Setup complete!
echo.
echo Available commands:
echo   npm run dev          - Start both frontend and backend
echo   npm run backend      - Start only backend
echo   npm run frontend     - Start only frontend
echo   npm run seed         - Seed the database
echo   npm run setup        - Full setup (install + seed)
echo.
echo Press any key to exit...
pause > nul
