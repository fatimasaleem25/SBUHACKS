#!/bin/bash

# Script to copy MindMesh project to GitHub repository folder
# This will create/clone the repo in a separate folder and copy files

set -e

GITHUB_REPO="https://github.com/fatimasaleem25/SBUHACKS.git"
REPO_FOLDER="/Users/fatima/SBUHACKS"
SOURCE_FOLDER="/Users/fatima/mindmesh"

echo "🚀 Setting up MindMesh in GitHub repository folder..."
echo ""
echo "Source: $SOURCE_FOLDER"
echo "Destination: $REPO_FOLDER"
echo ""

# Step 1: Check if repo folder exists
if [ -d "$REPO_FOLDER" ]; then
  echo "⚠️  Folder $REPO_FOLDER already exists"
  read -p "Do you want to remove it and start fresh? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing existing folder..."
    rm -rf "$REPO_FOLDER"
  else
    echo "❌ Aborted. Please choose a different folder name."
    exit 1
  fi
fi

# Step 2: Clone or create repo folder
echo "📦 Creating repository folder..."
mkdir -p "$REPO_FOLDER"
cd "$REPO_FOLDER"

# Step 3: Initialize git
echo "🔧 Initializing git repository..."
git init
git remote add origin "$GITHUB_REPO" 2>/dev/null || git remote set-url origin "$GITHUB_REPO"

# Step 4: Copy files from mindmesh (excluding .git, node_modules, .env)
echo "📋 Copying files from mindmesh..."
rsync -av --progress \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='*.log' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.cache' \
  "$SOURCE_FOLDER/" "$REPO_FOLDER/"

# Step 5: Verify .env files are not copied
echo ""
echo "🔍 Verifying .env files are excluded..."
if [ -f "$REPO_FOLDER/backend/.env" ] || [ -f "$REPO_FOLDER/frontend/.env" ]; then
  echo "⚠️  WARNING: .env files found! Removing..."
  rm -f "$REPO_FOLDER/backend/.env" "$REPO_FOLDER/frontend/.env" "$REPO_FOLDER/.env"
  echo "✅ .env files removed"
else
  echo "✅ No .env files found (good!)"
fi

# Step 6: Stage files
echo ""
echo "📝 Staging files..."
cd "$REPO_FOLDER"
git add .

# Step 7: Show status
echo ""
echo "📊 Files ready to commit:"
git status --short | head -20

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
echo "2. Review files:"
echo "   git status"
echo ""
echo "3. Commit files:"
echo "   git commit -m 'Initial commit: MindMesh - AI-powered collaborative mind mapping platform'"
echo ""
echo "4. Push to GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

