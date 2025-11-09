#!/bin/bash

# Script to push MindMesh to GitHub
# Repository: https://github.com/fatimasaleem25/SBUHACKS.git

echo "🚀 Setting up MindMesh for GitHub..."

cd "$(dirname "$0")"

# Initialize git if not already done
if [ ! -d .git ]; then
  echo "📦 Initializing git repository..."
  git init
fi

# Add remote repository
echo "🔗 Setting up remote repository..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/fatimasaleem25/SBUHACKS.git
echo "✅ Remote repository set to: https://github.com/fatimasaleem25/SBUHACKS.git"

# Check if .env files are being tracked (they shouldn't be)
echo "🔍 Checking for .env files..."
if git ls-files | grep -q "\.env$"; then
  echo "⚠️  WARNING: .env files are tracked! Removing from git..."
  git rm --cached backend/.env frontend/.env .env 2>/dev/null
  echo "✅ .env files removed from git tracking"
fi

# Stage all files
echo "📝 Staging files..."
git add .

# Show status
echo ""
echo "📊 Files to be committed:"
git status --short | head -20

# Check for .env files in staging
if git diff --cached --name-only | grep -q "\.env$"; then
  echo ""
  echo "⚠️  WARNING: .env files are in staging area!"
  echo "Removing .env files from staging..."
  git reset HEAD backend/.env frontend/.env .env 2>/dev/null
fi

echo ""
echo "✅ Ready to commit and push!"
echo ""
echo "Next steps:"
echo "1. Review the files: git status"
echo "2. Commit: git commit -m 'Initial commit: MindMesh application'"
echo "3. Push: git push -u origin main"
echo ""
echo "Or run: git commit -m 'Initial commit: MindMesh application' && git push -u origin main"

