# Push MindMesh to GitHub

## Repository
**https://github.com/fatimasaleem25/SBUHACKS.git**

## Quick Start

### Option 1: Use the Setup Script (Recommended)

```bash
cd /Users/fatima/mindmesh
./setup-and-push.sh
```

Then follow the instructions shown to commit and push.

### Option 2: Manual Steps

#### 1. Initialize Git (if not already done)
```bash
cd /Users/fatima/mindmesh
git init
```

#### 2. Configure Git User (if not already configured)
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

#### 3. Add Remote Repository
```bash
git remote add origin https://github.com/fatimasaleem25/SBUHACKS.git
```

Or if remote already exists:
```bash
git remote set-url origin https://github.com/fatimasaleem25/SBUHACKS.git
```

#### 4. Verify .env Files Are Ignored
```bash
# Check if .env files are tracked (should return nothing)
git ls-files | grep "\.env$"

# If .env files are tracked, remove them:
git rm --cached backend/.env frontend/.env .env
```

#### 5. Stage All Files
```bash
git add .
```

#### 6. Check What Will Be Committed
```bash
git status
```

**⚠️ IMPORTANT:** Make sure `.env` files are NOT in the list!

#### 7. Commit Files
```bash
git commit -m "Initial commit: MindMesh - AI-powered collaborative mind mapping platform"
```

#### 8. Push to GitHub
```bash
# Set branch to main (if not already)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Verify Setup

### Check Remote
```bash
git remote -v
```

Should show:
```
origin  https://github.com/fatimasaleem25/SBUHACKS.git (fetch)
origin  https://github.com/fatimasaleem25/SBUHACKS.git (push)
```

### Verify .env Files Are Ignored
```bash
git ls-files | grep "\.env"
```

Should return nothing.

### Check Status
```bash
git status
```

## Security Checklist

Before pushing, verify:
- [ ] `.env` files are in `.gitignore`
- [ ] `.env` files are NOT tracked by git
- [ ] No API keys in committed files
- [ ] No database credentials in code
- [ ] README.md is updated

## Troubleshooting

### Authentication Error
If you get authentication errors when pushing:

1. **Use Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Create a token with `repo` permissions
   - Use token as password when pushing

2. **Or use SSH:**
   ```bash
   # Generate SSH key (if not already done)
   ssh-keygen -t ed25519 -C "your.email@example.com"
   
   # Add to GitHub (copy public key)
   cat ~/.ssh/id_ed25519.pub
   
   # Change remote to SSH
   git remote set-url origin git@github.com:fatimasaleem25/SBUHACKS.git
   ```

### Branch Name Issues
If GitHub expects `main` but you're using `master`:
```bash
git branch -M main
git push -u origin main
```

### Large Files
If you have large files:
- Consider using Git LFS: `git lfs install`
- Or add large files to `.gitignore`

### Repository Doesn't Exist
If the repository doesn't exist on GitHub:
1. Go to https://github.com/new
2. Create repository named `SBUHACKS`
3. Do NOT initialize with README, .gitignore, or license
4. Then run the push commands

## After Pushing

1. Visit: https://github.com/fatimasaleem25/SBUHACKS
2. Verify all files are uploaded
3. Check that `.env` files are NOT visible
4. Update repository description on GitHub
5. Add topics/tags if desired

## Next Steps

- [ ] Update repository description on GitHub
- [ ] Add repository topics (e.g., `react`, `nodejs`, `ai`, `mindmap`)
- [ ] Set up GitHub Actions (if needed)
- [ ] Add LICENSE file
- [ ] Create issues for known bugs/features

## Need Help?

If you encounter issues:
1. Check the error message
2. Verify your GitHub credentials
3. Make sure the repository exists on GitHub
4. Check that you have write access to the repository

