#!/bin/bash

# Simple script to set up GitHub repository in a separate folder
# This will create /Users/fatima/SBUHACKS and copy files there

set -e

GITHUB_REPO="https://github.com/fatimasaleem25/SBUHACKS.git"
REPO_FOLDER="/Users/fatima/SBUHACKS"
SOURCE_FOLDER="/Users/fatima/mindmesh"

echo "🚀 Setting up GitHub repository in separate folder..."
echo ""

# Step 1: Create/clone repo folder
if [ -d "$REPO_FOLDER" ]; then
  echo "⚠️  Folder $REPO_FOLDER already exists"
  echo "Removing it to start fresh..."
  rm -rf "$REPO_FOLDER"
fi

echo "📦 Creating repository folder: $REPO_FOLDER"
mkdir -p "$REPO_FOLDER"
cd "$REPO_FOLDER"

# Step 2: Initialize git
echo "🔧 Initializing git..."
git init
git remote add origin "$GITHUB_REPO" 2>/dev/null || git remote set-url origin "$GITHUB_REPO"

# Step 3: Copy files (excluding sensitive files)
echo "📋 Copying files from $SOURCE_FOLDER..."
echo "   (excluding .env, node_modules, .git, etc.)"

# Use find and cp to copy files while excluding certain patterns
cd "$SOURCE_FOLDER"
find . -type f \
  ! -path "./.git/*" \
  ! -path "./node_modules/*" \
  ! -path "./backend/node_modules/*" \
  ! -path "./frontend/node_modules/*" \
  ! -name ".env" \
  ! -name ".env.*" \
  ! -name "*.log" \
  ! -path "./dist/*" \
  ! -path "./build/*" \
  ! -path "./.cache/*" \
  -exec cp --parents {} "$REPO_FOLDER/" \; 2>/dev/null || \
find . -type f \
  ! -path "./.git/*" \
  ! -path "./node_modules/*" \
  ! -path "./backend/node_modules/*" \
  ! -path "./frontend/node_modules/*" \
  ! -name ".env" \
  ! -name ".env.*" \
  ! -name "*.log" \
  ! -path "./dist/*" \
  ! -path "./build/*" \
  ! -path "./.cache/*" \
  -exec sh -c 'mkdir -p "$2/$(dirname "$1")" && cp "$1" "$2/$1"' _ {} "$REPO_FOLDER" \;

# Step 4: Copy .gitignore and other important files explicitly
cp .gitignore "$REPO_FOLDER/" 2>/dev/null || true
cp README.md "$REPO_FOLDER/" 2>/dev/null || true

# Step 5: Verify .env files don't exist
echo ""
echo "🔍 Verifying .env files are excluded..."
cd "$REPO_FOLDER"
if find . -name ".env" -o -name ".env.*" | grep -v ".env.example" | head -1 | grep -q .; then
  echo "⚠️  Removing .env files..."
  find . -name ".env" -not -name ".env.example" -delete
  find . -name ".env.*" -not -name ".env.example" -delete
fi
echo "✅ Verification complete"

# Step 6: Stage files
echo ""
echo "📝 Staging files..."
git add .

# Step 7: Show summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup complete!"
echo ""
echo "Repository location: $REPO_FOLDER"
echo ""
echo "Next steps:"
echo ""
echo "1. Navigate to repository:"
echo "   cd $REPO_FOLDER"
echo ""
echo "2. Review what will be committed:"
echo "   git status"
echo ""
echo "3. Commit and push:"
echo "   git commit -m 'Initial commit: MindMesh application'"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

