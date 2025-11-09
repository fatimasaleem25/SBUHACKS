# Install Missing Dependencies

## Issue
The backend server is crashing because the `openai` package is not installed.

## Solution

Run this command in the backend directory:

```bash
cd /Users/fatima/mindmesh/backend
npm install
```

This will install all dependencies listed in `package.json`, including:
- `openai` (for GPT-4 support)
- `@google/generative-ai` (for Gemini support)
- `elevenlabs` (for text-to-speech)
- All other required packages

## After Installation

Once installed, start the server:

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
⚠️ OpenAI service not available (package may not be installed). Will use Gemini as fallback.
🚀 Server running on http://localhost:4000
```

Or if OpenAI is successfully installed:
```
✅ MongoDB connected
✅ OpenAI service loaded
🚀 Server running on http://localhost:4000
```

## Note

The server has been updated to work **even if OpenAI is not installed**. It will:
- Start successfully without the `openai` package
- Use Gemini as the default AI provider
- Automatically fall back to Gemini if OpenAI is requested but not available
- Show a warning message if OpenAI is not available

However, to use GPT-4 features, you should install the package:

```bash
npm install openai@^4.52.0
```

## Verify Installation

Check if packages are installed:

```bash
npm list openai
npm list @google/generative-ai
```

## Troubleshooting

### If npm install fails:
1. Check Node.js version: `node --version` (should be 18+)
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and `package-lock.json`, then reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### If server still crashes:
1. Check for other missing dependencies
2. Verify `.env` file has required environment variables
3. Check MongoDB connection
4. Look at error messages in the terminal

