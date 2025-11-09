# Email Setup for Collaboration Invitations

## Overview
The collaboration system now sends email invitations when you invite someone to collaborate on a project. You need to configure an email service to enable this feature.

## Email Service Options

### Option 1: SendGrid (Recommended for Production)

SendGrid offers a free tier with 100 emails per day.

1. **Sign up for SendGrid:**
   - Go to https://sendgrid.com
   - Create a free account
   - Verify your email

2. **Create an API Key:**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Give it a name (e.g., "MindMesh Invitations")
   - Select "Full Access" or "Mail Send" permissions
   - Copy the API key (you won't see it again!)

3. **Configure Environment Variables:**
   Add to your `.env` file:
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   FRONTEND_URL=http://localhost:5173
   ```

### Option 2: Mailgun (Alternative)

Mailgun offers a free tier with 5,000 emails per month for 3 months.

1. **Sign up for Mailgun:**
   - Go to https://mailgun.com
   - Create a free account
   - Verify your domain (or use sandbox domain for testing)

2. **Get API Key:**
   - Go to Sending → API Keys
   - Copy your API key

3. **Configure Environment Variables:**
   Add to your `.env` file:
   ```env
   EMAIL_SERVICE=mailgun
   MAILGUN_API_KEY=your_mailgun_api_key_here
   MAILGUN_DOMAIN=your_domain.com
   MAILGUN_SMTP_USER=postmaster@your_domain.com
   EMAIL_FROM=noreply@yourdomain.com
   FRONTEND_URL=http://localhost:5173
   ```

### Option 3: Gmail SMTP (For Development/Testing)

⚠️ **Note:** Gmail SMTP is not recommended for production due to rate limits and security restrictions.

1. **Enable App Password:**
   - Go to your Google Account settings
   - Enable 2-Step Verification
   - Go to App Passwords
   - Generate a new app password for "Mail"

2. **Configure Environment Variables:**
   Add to your `.env` file:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASSWORD=your_app_password_here
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_FROM=your_gmail@gmail.com
   FRONTEND_URL=http://localhost:5173
   ```

### Option 4: Custom SMTP Server

If you have your own SMTP server:

```env
   EMAIL_HOST=your_smtp_server.com
   EMAIL_PORT=587
   EMAIL_USER=your_smtp_username
   EMAIL_PASSWORD=your_smtp_password
   EMAIL_FROM=noreply@yourdomain.com
   FRONTEND_URL=http://localhost:5173
```

## Environment Variables Summary

```env
# Email Service Configuration
EMAIL_SERVICE=sendgrid  # Options: 'sendgrid', 'mailgun', 'gmail', or leave empty for SMTP
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173  # Frontend URL for invitation links

# SendGrid Configuration (if using SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key

# Mailgun Configuration (if using Mailgun)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain.com
MAILGUN_SMTP_USER=postmaster@your_domain.com

# SMTP Configuration (if using custom SMTP or Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_password
```

## Installation

1. **Install nodemailer:**
   ```bash
   cd /Users/fatima/mindmesh/backend
   npm install nodemailer
   ```

2. **Add environment variables to `.env`:**
   - Copy the appropriate configuration above
   - Replace placeholder values with your actual credentials

3. **Restart the backend server:**
   ```bash
   npm run dev
   ```

## Testing

1. **Test Email Configuration:**
   When you start the server, you should see:
   ```
   ✅ Email service configured and ready
   ```

2. **Send a Test Invitation:**
   - Go to the Collaborators page in your app
   - Invite someone to a project
   - Check their email inbox

3. **Check Server Logs:**
   You should see:
   ```
   ✅ Invitation email sent to user@example.com: <message-id>
   ```

## Troubleshooting

### Email Not Sending

1. **Check Environment Variables:**
   - Make sure all required variables are set in `.env`
   - Verify API keys are correct
   - Check that `EMAIL_FROM` is valid

2. **Check Server Logs:**
   - Look for email service verification messages
   - Check for error messages when sending emails

3. **SendGrid Issues:**
   - Verify your API key has "Mail Send" permissions
   - Check SendGrid dashboard for sending stats
   - Verify sender email is authenticated in SendGrid

4. **Gmail SMTP Issues:**
   - Make sure 2-Step Verification is enabled
   - Use App Password, not your regular password
   - Check if "Less secure app access" is enabled (if not using App Password)

5. **Mailgun Issues:**
   - Verify your domain is verified in Mailgun
   - Check API key permissions
   - Verify SMTP user credentials

### Email Service Not Configured Warning

If you see:
```
⚠️ Email service not configured. Emails will not be sent.
```

This means:
- No email credentials are set in `.env`
- The invitation will still be saved in the database
- Users can still accept invitations through the app UI
- But no email notification will be sent

### Email Sending Fails Silently

The system is designed to:
- Save the invitation even if email fails
- Log errors but not fail the API request
- Allow users to accept invitations through the app even without email

## Production Considerations

1. **Use a Professional Email Service:**
   - SendGrid or Mailgun for production
   - Avoid Gmail SMTP for production

2. **Set Up Domain Authentication:**
   - Verify your domain with your email service
   - Set up SPF, DKIM, and DMARC records
   - This improves deliverability

3. **Monitor Email Delivery:**
   - Check email service dashboard for delivery rates
   - Set up webhooks for bounce/complaint notifications
   - Monitor spam rates

4. **Rate Limiting:**
   - Be aware of rate limits on free tiers
   - Consider upgrading for high-volume usage

5. **Email Templates:**
   - Customize email templates in `emailService.js`
   - Add your branding
   - Test on multiple email clients

## Email Template Customization

Edit `backend/src/services/emailService.js` to customize:
- Email subject line
- HTML email template
- Plain text email template
- Branding and styling

## Support

For issues with:
- **SendGrid:** https://support.sendgrid.com
- **Mailgun:** https://www.mailgun.com/support
- **Gmail:** https://support.google.com/mail

For application issues, check server logs and verify environment variables.

