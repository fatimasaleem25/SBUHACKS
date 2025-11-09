# GitHub Setup Guide for MindMesh

## Repository
https://github.com/fatimasaleem25/SBUHACKS.git

## Steps to Push to GitHub

### 1. Initialize Git (if not already done)
```bash
cd /Users/fatima/mindmesh
git init
```

### 2. Add Remote Repository
```bash
git remote add origin https://github.com/fatimasaleem25/SBUHACKS.git
```

Or if remote already exists:
```bash
git remote set-url origin https://github.com/fatimasaleem25/SBUHACKS.git
```

### 3. Verify .gitignore is Properly Configured
Make sure `.gitignore` includes:
- `.env` files (both backend and frontend)
- `node_modules/`
- `*.log` files
- Build artifacts
- IDE files

### 4. Stage All Files
```bash
git add .
```

### 5. Check What Will Be Committed
```bash
git status
```

**Important:** Make sure `.env` files are NOT in the list. If they are, they're not being ignored properly.

### 6. Commit Files
```bash
git commit -m "Initial commit: MindMesh application with AI features, collaboration, and recording capabilities"
```

### 7. Push to GitHub
```bash
git push -u origin main
```

Or if your default branch is `master`:
```bash
git push -u origin master
```

## Important: Environment Variables

**DO NOT commit `.env` files!** They contain sensitive information:
- MongoDB connection strings
- Auth0 secrets
- API keys (Gemini, OpenAI, ElevenLabs, etc.)

The `.gitignore` file should exclude:
- `backend/.env`
- `frontend/.env`
- Any `.env.*` files

## Creating .env.example Files (Optional but Recommended)

Create example environment files without sensitive data:

**backend/.env.example:**
```env
PORT=4001
MONGO_URI=your_mongodb_connection_string
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_audience
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173
```

**frontend/.env.example:**
```env
VITE_API_URL=http://localhost:4001
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=your_auth0_audience
```

## Troubleshooting

### Authentication Issues
If you get authentication errors when pushing:
1. Use GitHub Personal Access Token instead of password
2. Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### Large Files
If you have large files (like audio/video):
- Consider using Git LFS: `git lfs install`
- Or add them to `.gitignore`

### Branch Name
If GitHub expects `main` but you're using `master`:
```bash
git branch -M main
git push -u origin main
```

## After Pushing

1. Verify files on GitHub
2. Check that `.env` files are NOT visible
3. Update README.md with setup instructions
4. Add a LICENSE file if needed

## Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] No API keys in committed files
- [ ] No database credentials in code
- [ ] No Auth0 secrets in repository
- [ ] `.env.example` files created (without real values)

