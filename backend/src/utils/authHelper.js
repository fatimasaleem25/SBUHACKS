// Helper function to extract user email from Auth0 token
// Auth0 stores email in different places depending on configuration
export function getUserEmail(req) {
  // Try different possible locations for email in Auth0 token
  // Auth0 typically stores email in req.auth.email, but it might be in different places
  const email = req.auth?.email || 
         req.auth?.['https://mindmesh.app/email'] ||
         req.auth?.['https://mindmesh.us.auth0.com/email'] ||
         req.auth?.['email'] ||
         req.user?.email ||
         req.auth?.user_email ||
         '';
  
  // Log for debugging if email is not found (only in development)
  if (!email && process.env.NODE_ENV !== 'production') {
    console.log('🔍 Debug: Email not found in token. Available auth keys:', Object.keys(req.auth || {}));
    console.log('🔍 Debug: Available user keys:', Object.keys(req.user || {}));
    console.log('🔍 Debug: Auth object:', JSON.stringify(req.auth, null, 2));
  }
  
  return email;
}

// Helper function to get user data from Auth0 token
export function getUserData(req) {
  return {
    userId: req.auth?.sub,
    email: getUserEmail(req),
    name: req.auth?.name || req.user?.name,
    picture: req.auth?.picture || req.user?.picture
  };
}

