#!/bin/bash

# Start Backend Server Script for MindMesh

echo "🚀 Starting MindMesh Backend Server..."
echo ""

cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  Warning: .env file not found"
  echo "Please create a .env file with required environment variables"
  echo "See QUICK_START.md for details"
  echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Check if port 4000 is available
if lsof -ti:4000 > /dev/null 2>&1; then
  echo "⚠️  Port 4000 is already in use"
  echo "Killing process on port 4000..."
  lsof -ti:4000 | xargs kill -9 2>/dev/null
  sleep 1
fi

# Start the server
echo "✅ Starting server on port 4000..."
echo "Press Ctrl+C to stop the server"
echo ""
npm run dev

