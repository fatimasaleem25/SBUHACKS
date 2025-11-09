# Quick Setup: Push to GitHub from New Folder

## Repository: https://github.com/fatimasaleem25/SBUHACKS.git

## Option 1: Use the Automated Script (Easiest)

```bash
cd /Users/fatima/mindmesh
./setup-github-repo.sh
```

Then:
```bash
cd /Users/fatima/SBUHACKS
git commit -m "Initial commit: MindMesh application"
git branch -M main
git push -u origin main
```

## Option 2: Manual Setup

### Step 1: Clone or Create Repository Folder
```bash
cd /Users/fatima

# Option A: Clone if repo exists on GitHub
gh repo clone fatimasaleem25/SBUHACKS
# OR
git clone https://github.com/fatimasaleem25/SBUHACKS.git

# Option B: Create new folder if repo doesn't exist
mkdir SBUHACKS
cd SBUHACKS
git init
git remote add origin https://github.com/fatimasaleem25/SBUHACKS.git
```

### Step 2: Copy Files from mindmesh
```bash
cd /Users/fatima/SBUHACKS

# Copy all files except sensitive ones
cp -r ../mindmesh/* .
cp -r ../mindmesh/.[^.]* . 2>/dev/null || true

# Remove sensitive files
rm -f backend/.env frontend/.env .env
rm -rf .git node_modules backend/node_modules frontend/node_modules
```

### Step 3: Verify .gitignore is Present
```bash
# Make sure .gitignore exists and excludes .env
cat .gitignore | grep -i ".env"
```

### Step 4: Commit and Push
```bash
git add .
git status  # Verify .env files are NOT listed

git commit -m "Initial commit: MindMesh - AI-powered collaborative mind mapping platform"
git branch -M main
git push -u origin main
```

## What This Does

1. Creates `/Users/fatima/SBUHACKS` folder (separate from mindmesh)
2. Initializes git repository
3. Copies all files from mindmesh (excluding .env, node_modules, etc.)
4. Sets up remote to point to GitHub
5. Ready to commit and push

## Folder Structure After Setup

```
/Users/fatima/
├── mindmesh/          # Your original project (unchanged)
└── SBUHACKS/          # GitHub repository (synced with GitHub)
    ├── backend/
    ├── frontend/
    ├── .gitignore
    ├── README.md
    └── ...
```

## Important Notes

- ✅ Your original `mindmesh` folder stays untouched
- ✅ `SBUHACKS` folder is separate and synced with GitHub
- ✅ `.env` files are excluded from GitHub
- ✅ Work in `SBUHACKS` folder for GitHub updates

## Troubleshooting

### If Repository Doesn't Exist on GitHub
1. Create it at: https://github.com/new
2. Name it: `SBUHACKS`
3. Don't initialize with README
4. Then run the setup script

### Authentication Error
Use GitHub Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Generate token with `repo` permissions
3. Use token as password when pushing

### Files Not Copying
Make sure you have permissions:
```bash
ls -la /Users/fatima/mindmesh
```

