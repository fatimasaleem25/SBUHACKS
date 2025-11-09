#!/bin/bash

# Complete script to set up and push MindMesh to GitHub
# Repository: https://github.com/fatimasaleem25/SBUHACKS.git

set -e  # Exit on error

echo "🚀 Setting up MindMesh for GitHub..."
echo ""

cd "$(dirname "$0")"

# Step 1: Initialize git if needed
if [ ! -d .git ]; then
  echo "📦 Initializing git repository..."
  git init
else
  echo "✅ Git repository already initialized"
fi

# Step 2: Configure git user if not set
if [ -z "$(git config user.name)" ]; then
  echo "⚠️  Git user.name not set. Please configure:"
  echo "   git config user.name 'Your Name'"
  echo "   git config user.email 'your.email@example.com'"
fi

# Step 3: Add remote
echo ""
echo "🔗 Setting up remote repository..."
if git remote | grep -q "^origin$"; then
  git remote set-url origin https://github.com/fatimasaleem25/SBUHACKS.git
  echo "✅ Remote 'origin' updated"
else
  git remote add origin https://github.com/fatimasaleem25/SBUHACKS.git
  echo "✅ Remote 'origin' added"
fi

# Step 4: Verify .env files are not tracked
echo ""
echo "🔍 Checking for .env files..."
if git ls-files 2>/dev/null | grep -q "\.env$"; then
  echo "⚠️  WARNING: .env files are tracked!"
  echo "Removing from git cache..."
  git rm --cached backend/.env frontend/.env .env 2>/dev/null || true
  echo "✅ .env files removed from tracking"
else
  echo "✅ No .env files tracked (good!)"
fi

# Step 5: Stage all files
echo ""
echo "📝 Staging files..."
git add .

# Step 6: Check what's staged
echo ""
echo "📊 Files staged for commit:"
git status --short | head -20

# Step 7: Check for .env in staging
if git diff --cached --name-only 2>/dev/null | grep -q "\.env$"; then
  echo ""
  echo "⚠️  WARNING: .env files are in staging area!"
  echo "Unstaging .env files..."
  git reset HEAD backend/.env frontend/.env .env 2>/dev/null || true
  echo "✅ .env files removed from staging"
fi

# Step 8: Show summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Review files:"
echo "   git status"
echo ""
echo "2. Commit files:"
echo "   git commit -m 'Initial commit: MindMesh - AI-powered collaborative mind mapping platform'"
echo ""
echo "3. Push to GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Or run all at once:"
echo "   git commit -m 'Initial commit: MindMesh application' && git branch -M main && git push -u origin main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

