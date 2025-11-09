# Change Backend Port to 4001

## Quick Steps

### 1. Update Backend .env File

Open or create `backend/.env` and set:
```env
PORT=4001
```

If the file already has other settings, just change the PORT line:
```env
PORT=4001
MONGO_URI=your_mongodb_connection_string
AUTH0_DOMAIN=mindmesh.us.auth0.com
AUTH0_AUDIENCE=https://mindmesh-api
GEMINI_API_KEY=your_gemini_key
# ... other settings
```

### 2. Update Frontend .env File

Open or create `frontend/.env` and set:
```env
VITE_API_URL=http://localhost:4001
```

### 3. Restart Servers

**Backend:**
```bash
cd /Users/fatima/mindmesh/backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:4001
```

**Frontend:**
```bash
cd /Users/fatima/mindmesh/frontend
# Stop current server (Ctrl+C) and restart
npm run dev
```

### 4. Verify

Test the backend:
```bash
curl http://localhost:4001/api/health
```

Should return:
```json
{"status":"ok","message":"Backend is running"}
```

## Alternative: Use the Script

Run the provided script:
```bash
cd /Users/fatima/mindmesh/backend
./change-port.sh
```

Then restart both servers.

## Notes

- The backend `server.js` already uses `process.env.PORT || 4000`, so it will automatically use PORT from .env
- The frontend `api.js` uses `import.meta.env.VITE_API_URL || 'http://localhost:4000'`, so it will use the .env value
- Make sure to restart both servers after changing .env files
- Vite (frontend) requires a restart to pick up .env changes

## Troubleshooting

### Port 4001 Already in Use
```bash
# Find what's using port 4001
lsof -ti:4001

# Kill the process
kill -9 $(lsof -ti:4001)

# Or use a different port (e.g., 4002)
```

### Frontend Still Connecting to 4000
1. Make sure `VITE_API_URL=http://localhost:4001` is in `frontend/.env`
2. Restart the frontend server (Vite needs restart to pick up .env changes)
3. Clear browser cache if needed

### Backend Still Running on 4000
1. Make sure `PORT=4001` is in `backend/.env`
2. Restart the backend server
3. Check that no other process is using port 4000

