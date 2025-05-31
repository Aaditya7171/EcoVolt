#!/bin/bash

# EcoVolt Deployment Setup Script
# This script helps prepare your project for deployment

echo "🚀 EcoVolt Deployment Setup"
echo "=========================="

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Make deploy-check.js executable
if [ -f "scripts/deploy-check.js" ]; then
    chmod +x scripts/deploy-check.js
    echo "✅ Made deploy-check.js executable"
fi

# Check Node.js version
echo ""
echo "🔍 Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js version: $NODE_VERSION"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo "✅ Node.js version is compatible (>= 18)"
    else
        echo "⚠️  Node.js version should be >= 18 for optimal compatibility"
    fi
else
    echo "❌ Node.js is not installed"
    exit 1
fi

# Check npm version
echo ""
echo "🔍 Checking npm version..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm version: $NPM_VERSION"
else
    echo "❌ npm is not installed"
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

echo "Installing backend dependencies..."
cd backend
if npm install; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

cd ..
echo "Installing frontend dependencies..."
cd frontend
if npm install; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

# Run deployment check
echo ""
echo "🔍 Running deployment readiness check..."
if command -v node &> /dev/null; then
    node scripts/deploy-check.js
else
    echo "❌ Cannot run deployment check - Node.js not found"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Review the deployment check results above"
echo "2. Update environment variables in .env.production files"
echo "3. Push your code to GitHub: https://github.com/Aaditya7171/EcoVolt.git"
echo "4. Follow the DEPLOYMENT.md guide for detailed deployment instructions"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo "🔧 To check deployment readiness again, run: node scripts/deploy-check.js"
