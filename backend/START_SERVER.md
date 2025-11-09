# How to Start the Backend Server

## Quick Start

1. **Navigate to backend directory:**
   ```bash
   cd /Users/fatima/mindmesh/backend
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Make sure .env file is configured:**
   - Check that `.env` file exists
   - Required variables:
     - `MONGO_URI` - MongoDB connection string
     - `AUTH0_DOMAIN` - Your Auth0 domain
     - `AUTH0_AUDIENCE` - Your Auth0 audience
     - `AUTH0_CLIENT_ID` - Your Auth0 client ID (optional)
     - `PORT` - Server port (default: 4000)
     - `GEMINI_API_KEY` - Google Gemini API key
     - `ELEVENLABS_API_KEY` - ElevenLabs API key (optional)
     - `OPENAI_API_KEY` - OpenAI API key (optional)

4. **Start the server:**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

## Verify Server is Running

Once started, you should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:4000
```

## Troubleshooting

### Port 4000 already in use
```bash
# Find what's using port 4000
lsof -ti:4000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port
PORT=4001 npm run dev
```

### MongoDB connection error
- Check your `MONGO_URI` in `.env`
- Verify your IP is whitelisted in MongoDB Atlas
- Check MongoDB Atlas dashboard for connection status

### Missing dependencies
```bash
npm install
```

### Server won't start
- Check Node.js version: `node --version` (should be 18+)
- Check for syntax errors: `node src/server.js`
- Check console for error messages

## Environment Variables

Create a `.env` file in the backend directory with:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_audience
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
OPENAI_API_KEY=your_openai_api_key (optional)
SNOWFLAKE_ACCOUNT=your_snowflake_account (optional)
SNOWFLAKE_USERNAME=your_snowflake_username (optional)
SNOWFLAKE_PASSWORD=your_snowflake_password (optional)
SNOWFLAKE_WAREHOUSE=your_warehouse (optional)
SNOWFLAKE_DATABASE=your_database (optional)
SNOWFLAKE_SCHEMA=PUBLIC (optional)
```

## Testing the Server

Once running, test with:
```bash
curl http://localhost:4000/api/health
```

Should return:
```json
{"status":"ok","message":"Backend is running"}
```

