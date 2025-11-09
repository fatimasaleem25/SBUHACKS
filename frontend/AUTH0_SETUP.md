# Auth0 Callback URL Configuration

## Current Configuration

Your app is configured to use:
- **Callback URL**: `http://localhost:5173` (or whatever port Vite uses)
- **Logout URL**: `http://localhost:5173`

## Auth0 Dashboard Configuration

To fix the callback URL error, make sure your Auth0 dashboard has the following:

### 1. Allowed Callback URLs
In your Auth0 Application settings, under "Application URIs", add:
```
http://localhost:5173
http://localhost:5173/
```

### 2. Allowed Logout URLs
Add:
```
http://localhost:5173
http://localhost:5173/
```

### 3. Allowed Web Origins
Add:
```
http://localhost:5173
```

### 4. If you're using a different port
Check what port your dev server is running on:
```bash
npm run dev
```

Then update the URLs above to match your actual port number.

## Common Issues

1. **Trailing slash mismatch**: Auth0 is sensitive to trailing slashes. Try both with and without.
2. **Port mismatch**: Make sure the port in Auth0 matches your dev server port.
3. **HTTP vs HTTPS**: For local development, use `http://` not `https://`
4. **Multiple URLs**: You can add multiple URLs separated by commas:
   ```
   http://localhost:5173,http://localhost:5173/
   ```

## Steps to Fix

1. Go to Auth0 Dashboard → Applications → Your Application
2. Scroll to "Application URIs" section
3. Add the callback URLs listed above
4. Save changes
5. Try logging in again

