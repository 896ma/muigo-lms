@echo off
echo Building and deploying Farmers LMS...

echo.
echo Step 1: Installing dependencies...
call npm run install:all

echo.
echo Step 2: Building frontend...
call npm run build:frontend

echo.
echo Step 3: Starting production server...
echo The application will be available at http://localhost:5000
echo.
call npm run start:backend

pause
