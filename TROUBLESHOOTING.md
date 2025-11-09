# Troubleshooting: Projects Not Loading

If your projects are stuck on "Loading projects...", follow these steps:

## 1. Check if Backend is Running

The backend server needs to be running for the frontend to fetch projects.

### Start the Backend:

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

## 2. Check API URL Configuration

Make sure your frontend `.env` file has the correct API URL:

```env
VITE_API_URL=http://localhost:5000
```

The default is `http://localhost:5000` if not set.

## 3. Check Backend Port

Verify the backend is running on the correct port. Check `backend/.env`:

```env
PORT=5000
```

Or check `backend/src/server.js` - it defaults to port 5000.

## 4. Check MongoDB Connection

The backend needs MongoDB to be running. Check `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
```

## 5. Check Browser Console

Open your browser's Developer Tools (F12) and check:
- **Console tab**: Look for error messages
- **Network tab**: Check if the request to `/api/ideas` is failing

## 6. Common Error Messages

### "Request timed out"
- Backend server is not running
- Backend is running on a different port
- Firewall blocking the connection

### "Cannot connect to backend server"
- Backend is not running
- Wrong API URL in frontend `.env`
- CORS issues (check backend CORS configuration)

### "User ID not found in token"
- Auth0 token issue
- Check Auth0 configuration

## 7. Quick Test

Test if the backend is accessible:

```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"ok","message":"Backend is running"}
```

## 8. Restart Everything

If nothing works, try restarting:

1. Stop the backend (Ctrl+C)
2. Stop the frontend (Ctrl+C)
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm run dev`
5. Refresh the browser

## Still Having Issues?

Check the logs:
- Backend terminal for server errors
- Browser console for frontend errors
- Network tab for failed requests

