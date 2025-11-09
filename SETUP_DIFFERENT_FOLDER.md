# Push MindMesh to GitHub from Different Folder

## Option 1: Clone Repository to New Folder (Recommended)

### Step 1: Clone the Repository
```bash
cd /Users/fatima
gh repo clone fatimasaleem25/SBUHACKS
# OR
git clone https://github.com/fatimasaleem25/SBUHACKS.git
```

### Step 2: Copy Files from mindmesh
```bash
# Copy files (excluding sensitive files)
cd /Users/fatima
rsync -av --progress \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='*.log' \
  --exclude='dist' \
  --exclude='build' \
  mindmesh/ SBUHACKS/
```

### Step 3: Navigate to Repository and Push
```bash
cd /Users/fatima/SBUHACKS
git add .
git commit -m "Initial commit: MindMesh application"
git branch -M main
git push -u origin main
```

## Option 2: Use the Copy Script

Run the automated script:
```bash
cd /Users/fatima/mindmesh
./copy-to-github-repo.sh
```

Then follow the instructions to commit and push.

## Option 3: Manual Setup in New Folder

### Step 1: Create New Folder
```bash
cd /Users/fatima
mkdir SBUHACKS
cd SBUHACKS
```

### Step 2: Initialize Git
```bash
git init
git remote add origin https://github.com/fatimasaleem25/SBUHACKS.git
```

### Step 3: Copy Files
```bash
# Copy all files except .env and node_modules
cp -r ../mindmesh/* .
cp -r ../mindmesh/.* . 2>/dev/null || true

# Remove sensitive files
rm -f backend/.env frontend/.env .env
rm -rf node_modules backend/node_modules frontend/node_modules
```

### Step 4: Commit and Push
```bash
git add .
git commit -m "Initial commit: MindMesh application"
git branch -M main
git push -u origin main
```

## Verify Setup

### Check Repository Location
```bash
cd /Users/fatima/SBUHACKS
pwd
# Should show: /Users/fatima/SBUHACKS
```

### Verify Remote
```bash
git remote -v
# Should show: origin  https://github.com/fatimasaleem25/SBUHACKS.git
```

### Verify .env Files Are Excluded
```bash
git ls-files | grep ".env"
# Should return nothing
```

## Important Notes

1. **Keep mindmesh folder separate** - Your original `mindmesh` folder remains unchanged
2. **SBUHACKS is the GitHub repo** - This folder will be synced with GitHub
3. **.env files are excluded** - Sensitive files won't be pushed
4. **Work in SBUHACKS** - Make changes in the SBUHACKS folder for GitHub

## After Setup

Your folder structure will be:
```
/Users/fatima/
├── mindmesh/          # Original project (local only)
└── SBUHACKS/          # GitHub repository (synced with GitHub)
```

## Troubleshooting

### Repository Already Exists
If the folder already exists:
```bash
rm -rf /Users/fatima/SBUHACKS
# Then run the setup again
```

### Authentication Issues
If you get authentication errors:
1. Use GitHub Personal Access Token
2. Or set up SSH keys

### Files Not Copying
Make sure you have permissions:
```bash
ls -la /Users/fatima/mindmesh
```

