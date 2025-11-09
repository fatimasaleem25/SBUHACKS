# Port Change Documentation

## Port Changed from 4000 to 4001

### Backend Configuration
- **File**: `backend/.env`
- **Setting**: `PORT=4001`
- **Server**: Will run on `http://localhost:4001`

### Frontend Configuration
- **File**: `frontend/.env`
- **Setting**: `VITE_API_URL=http://localhost:4001`
- **All API calls**: Will target `http://localhost:4001`

## To Apply Changes

### 1. Restart Backend Server
```bash
cd /Users/fatima/mindmesh/backend
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:4001
```

### 2. Restart Frontend Server
```bash
cd /Users/fatima/mindmesh/frontend
# Stop current server (Ctrl+C) and restart
npm run dev
```

### 3. Verify Connection
Test that frontend can connect to backend:
```bash
curl http://localhost:4001/api/health
```

Should return:
```json
{"status":"ok","message":"Backend is running"}
```

## Why Change Port?

Common reasons to change port:
- Port 4000 is already in use by another application
- Avoiding conflicts with other services
- Testing multiple environments
- Following organizational port conventions

## Reverting to Port 4000

If you want to revert back to port 4000:

1. **Backend `.env`**:
   ```env
   PORT=4000
   ```

2. **Frontend `.env`**:
   ```env
   VITE_API_URL=http://localhost:4000
   ```

3. Restart both servers

## Troubleshooting

### Port Still in Use
If port 4001 is also in use:
```bash
# Find what's using the port
lsof -ti:4001

# Kill the process (replace PID)
kill -9 PID

# Or use a different port
PORT=4002 npm run dev
```

### Frontend Can't Connect
1. Check backend is running on port 4001
2. Verify `VITE_API_URL` in frontend `.env`
3. Restart frontend server after changing `.env`
4. Check browser console for errors

### CORS Errors
If you get CORS errors, verify backend `server.js` has:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

