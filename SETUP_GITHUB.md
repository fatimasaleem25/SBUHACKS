# Push MindMesh to GitHub

## Repository
https://github.com/fatimasaleem25/SBUHACKS.git

## Quick Setup

### Option 1: Use the Script
```bash
cd /Users/fatima/mindmesh
./push-to-github.sh
```

Then commit and push:
```bash
git commit -m "Initial commit: MindMesh application"
git push -u origin main
```

### Option 2: Manual Setup

1. **Initialize Git** (if not already done):
   ```bash
   cd /Users/fatima/mindmesh
   git init
   ```

2. **Add Remote Repository**:
   ```bash
   git remote add origin https://github.com/fatimasaleem25/SBUHACKS.git
   ```

3. **Verify .gitignore**:
   Make sure `.gitignore` includes:
   - `.env` files
   - `node_modules/`
   - Build artifacts

4. **Stage Files**:
   ```bash
   git add .
   ```

5. **Check Status**:
   ```bash
   git status
   ```
   
   **IMPORTANT:** Make sure `.env` files are NOT listed. If they are, remove them:
   ```bash
   git rm --cached backend/.env frontend/.env
   ```

6. **Commit**:
   ```bash
   git commit -m "Initial commit: MindMesh - AI-powered collaborative mind mapping platform"
   ```

7. **Push to GitHub**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

## Verify .env Files Are Ignored

Before committing, verify:
```bash
git ls-files | grep ".env"
```

This should return nothing. If it shows `.env` files, remove them:
```bash
git rm --cached backend/.env frontend/.env .env
```

## After Pushing

1. Visit: https://github.com/fatimasaleem25/SBUHACKS
2. Verify files are uploaded
3. Check that `.env` files are NOT visible
4. Update repository description on GitHub

## Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] `.env` files are NOT in git history
- [ ] No API keys in committed files
- [ ] No database credentials in code
- [ ] README.md updated with setup instructions

## Troubleshooting

### Authentication Error
If you get authentication errors:
1. Use GitHub Personal Access Token
2. Or set up SSH keys

### Branch Name
If GitHub expects `main`:
```bash
git branch -M main
git push -u origin main
```

### Large Files
If you have large files, consider:
- Using Git LFS
- Adding to `.gitignore`

