# Fixing Auth0 Email Issues

## Problem
The error "Invalid email address format" occurs when sending invitations because the system cannot find a valid email address for the inviter.

## Root Cause
1. Auth0 tokens might not include email in the standard location
2. Projects created before email was properly configured might have `ownerEmail` set to `userId` instead of an email
3. The email scope might not be requested in the frontend

## Solutions

### Solution 1: Ensure Email Scope is Requested (Already Done)
✅ The frontend now requests `scope: 'openid profile email'` in `main.jsx`

### Solution 2: Log Out and Log Back In
1. **Log out** of the application
2. **Log back in** to get a fresh token with email included
3. This will ensure your token includes the email scope

### Solution 3: Check Auth0 Dashboard
1. Go to Auth0 Dashboard → APIs → Your API (`https://mindmesh-api`)
2. Go to **Settings** tab
3. Ensure **"Allow Skipping User Consent"** is enabled
4. Go to **Scopes** tab
5. Ensure `email` scope exists
6. Save changes

### Solution 4: Verify Your Auth0 User Has Email
1. Go to Auth0 Dashboard → User Management → Users
2. Find your user account
3. Verify that the user has an email address set
4. If not, add/update the email address

### Solution 5: Check Backend Logs
When you try to send an invitation, check the backend logs. You should see:
- `⚠️ Email not found in token, trying fallbacks...`
- `Auth object keys: [...]`
- Which fallback strategy was used

This will help identify where the email should be coming from.

## Testing
1. **Restart your frontend** to pick up the scope changes
2. **Log out and log back in** to get a fresh token
3. **Try sending an invitation** again
4. **Check backend logs** for debugging information

## If Still Not Working
The backend now has multiple fallback strategies:
1. Gets email from Auth0 token
2. Gets email from project owner (if you're the owner)
3. Gets email from collaborator record (if you're a collaborator)
4. Gets email from User model in database

If all of these fail, the error message will include debugging information to help identify the issue.

## Temporary Workaround
If you need to send invitations immediately and email is not available:
1. The invitation will still be saved in the database
2. Users can accept invitations through the app UI (Collaborators page)
3. Email notifications are optional - the invitation system works without them

