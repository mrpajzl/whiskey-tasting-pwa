#!/bin/bash

# Whiskey Tasting PWA Setup Script
# This script helps set up the development environment

set -e

echo "🥃 Whiskey Tasting PWA Setup"
echo "=============================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    echo "   Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from example..."
    cp .env.local.example .env.local
    echo "✅ .env.local created"
    echo ""
    echo "⚠️  You need to configure the following:"
    echo "   1. Run 'npx convex dev' to set up Convex"
    echo "   2. Add Clerk keys to .env.local"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Check for Convex configuration
if [ ! -d ".convex" ]; then
    echo "🔧 Setting up Convex..."
    echo "   Running 'npx convex dev' (this will open a browser)"
    echo ""
    echo "   Please follow these steps:"
    echo "   1. Log in to Convex (or create an account)"
    echo "   2. Create a new project"
    echo "   3. The CONVEX_URL will be added to .env.local"
    echo ""
    read -p "Press Enter to continue..."
    npx convex dev --once || true
    echo ""
fi

# Instructions
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Configure Clerk:"
echo "   - Go to https://dashboard.clerk.com"
echo "   - Create a new application"
echo "   - Copy the keys to .env.local:"
echo "     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_..."
echo "     CLERK_SECRET_KEY=sk_test_..."
echo ""
echo "2. Start development servers:"
echo "   Terminal 1: npx convex dev"
echo "   Terminal 2: npm run dev"
echo ""
echo "3. Open http://localhost:3000"
echo ""
echo "4. When ready to deploy:"
echo "   - Read DEPLOYMENT.md"
echo "   - Run: npx convex deploy"
echo "   - Run: npx vercel --prod"
echo ""
echo "✨ Setup complete! Happy tasting! 🥃"
