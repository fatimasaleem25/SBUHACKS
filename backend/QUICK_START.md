# Quick Start - Backend Server

## Start the Backend Server

1. **Navigate to backend directory:**
   ```bash
   cd /Users/fatima/mindmesh/backend
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Make sure .env file exists:**
   - Check that `.env` file exists in the backend directory
   - Required variables:
     - `MONGO_URI` - MongoDB connection string
     - `AUTH0_DOMAIN` - Your Auth0 domain
     - `AUTH0_AUDIENCE` - Your Auth0 audience
     - `PORT` - Server port (default: 4000)

4. **Start the server:**
   ```bash
   npm run dev
   ```

## Verify Server is Running

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:4000
```

## Test the Server

Open a new terminal and test:
```bash
curl http://localhost:4000/api/health
```

Should return:
```json
{"status":"ok","message":"Backend is running"}
```

## Common Issues

### Port 4000 Already in Use
```bash
# Find what's using port 4000
lsof -ti:4000

# Kill the process
kill -9 $(lsof -ti:4000)

# Or use a different port
PORT=4001 npm run dev
```

### MongoDB Connection Error
- Check your `MONGO_URI` in `.env`
- Verify MongoDB Atlas IP whitelist includes your IP
- Check MongoDB Atlas dashboard

### Missing Dependencies
```bash
npm install
```

### Email Service (Optional)
Email service is optional. If not configured, invitations will still work in the app UI, but no emails will be sent.

To enable emails, see `EMAIL_SETUP.md`

