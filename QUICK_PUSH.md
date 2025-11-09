# Quick Push to GitHub

## Repository: https://github.com/fatimasaleem25/SBUHACKS.git

## Run These Commands:

```bash
# 1. Navigate to project directory
cd /Users/fatima/mindmesh

# 2. Initialize git (if not already done)
git init

# 3. Add remote repository
git remote add origin https://github.com/fatimasaleem25/SBUHACKS.git
# OR if remote exists:
# git remote set-url origin https://github.com/fatimasaleem25/SBUHACKS.git

# 4. Configure git user (if not already done)
git config user.name "Fatima Saleem"
git config user.email "fatima.saleem@jjay.cuny.edu"

# 5. Stage all files
git add .

# 6. Verify .env files are NOT staged (run this and check output)
git status | grep -i ".env"
# If you see .env files, remove them:
# git reset HEAD backend/.env frontend/.env .env

# 7. Commit
git commit -m "Initial commit: MindMesh - AI-powered collaborative mind mapping platform"

# 8. Set branch to main and push
git branch -M main
git push -u origin main
```

## Or Run the Script:

```bash
cd /Users/fatima/mindmesh
./setup-and-push.sh
```

Then commit and push:
```bash
git commit -m "Initial commit: MindMesh application"
git branch -M main
git push -u origin main
```

## If Authentication Fails:

Use a Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Generate new token with `repo` permissions
3. Use token as password when pushing

