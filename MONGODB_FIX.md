# Fix MongoDB Connection Error

## Issue
You're seeing this error:
```
❌ MongoDB connection error: Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Solution

### Option 1: Whitelist Your IP Address (Recommended for Production)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Select your cluster
4. Click **"Network Access"** in the left sidebar
5. Click **"Add IP Address"**
6. Click **"Add Current IP Address"** (or enter your IP manually)
7. Click **"Confirm"**

### Option 2: Allow All IPs (For Development Only - Less Secure)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Select your cluster
4. Click **"Network Access"** in the left sidebar
5. Click **"Add IP Address"**
6. Enter `0.0.0.0/0` (allows all IPs)
7. Click **"Confirm"**

⚠️ **Warning**: Option 2 is less secure and should only be used for development.

## Verify Connection

After whitelisting your IP, restart your backend server:

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected
```

## Alternative: Use Local MongoDB

If you prefer to use a local MongoDB instance:

1. Install MongoDB locally
2. Update your `backend/.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/mindmesh
   ```

## Check Your Current IP

To find your current IP address:
- Visit: https://whatismyipaddress.com
- Or run: `curl ifconfig.me` in terminal

