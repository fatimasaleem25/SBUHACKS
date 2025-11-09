# Port Configuration Verification

## ✅ Configuration Status

### Backend Server
- **File**: `backend/src/server.js`
- **Port**: `4000` (line 19: `const PORT = process.env.PORT || 4000;`)
- **Status**: ✅ Configured correctly

### Frontend API Calls
- **File**: `frontend/src/services/api.js`
- **Port**: `4000` (default: `http://localhost:4000`)
- **Status**: ✅ Configured correctly

## Verification Steps

### 1. Check if Backend is Running

Open a terminal and run:
```bash
# Check if port 4000 is in use
lsof -ti:4000

# Or test the health endpoint
curl http://localhost:4000/api/health
```

**Expected Response (if running):**
```json
{"status":"ok","message":"Backend is running"}
```

**If not running, you'll see:**
```
curl: (7) Failed to connect to localhost port 4000
```

### 2. Start the Backend Server

If the server is not running, start it:

```bash
cd /Users/fatima/mindmesh/backend
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected
🚀 Server running on http://localhost:4000
```

### 3. Check Environment Variables

Make sure your `.env` file doesn't override the port:

```bash
cd /Users/fatima/mindmesh/backend
cat .env | grep PORT
```

If `PORT=5000` is set, either:
- Remove it (will use default 4000)
- Or change it to `PORT=4000`

## Current Configuration Summary

| Component | Port | Status |
|-----------|------|--------|
| Backend Server | 4000 | ✅ Configured |
| Frontend API | 4000 | ✅ Configured |
| Server Running | ? | ⚠️ Check with commands above |

## Quick Test

Run this in your terminal:
```bash
# Test if server is running
curl http://localhost:4000/api/health

# If it works, you'll see:
# {"status":"ok","message":"Backend is running"}

# If it doesn't work, start the server:
cd /Users/fatima/mindmesh/backend && npm run dev
```

## Troubleshooting

### Port 4000 Already in Use
```bash
# Find what's using port 4000
lsof -ti:4000

# Kill the process
kill -9 $(lsof -ti:4000)

# Or use a different port
PORT=4001 npm run dev
```

### Server Won't Start
1. Check MongoDB connection
2. Check environment variables in `.env`
3. Check for syntax errors: `node src/server.js`
4. Check Node.js version: `node --version` (should be 18+)

