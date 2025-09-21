#!/bin/bash

echo "Building and deploying Farmers LMS..."

echo ""
echo "Step 1: Installing dependencies..."
npm run install:all

echo ""
echo "Step 2: Building frontend..."
npm run build:frontend

echo ""
echo "Step 3: Starting production server..."
echo "The application will be available at http://localhost:5000"
echo ""
npm run start:backend
