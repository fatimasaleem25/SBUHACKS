import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email service configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@mindmesh.app';
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || ''; // e.g., 'gmail', 'sendgrid', etc.

// Create transporter
let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  // If using a service like SendGrid, Mailgun, etc.
  if (EMAIL_SERVICE === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    // SendGrid configuration
    transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else if (EMAIL_SERVICE === 'mailgun' && process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    // Mailgun configuration
    transporter = nodemailer.createTransport({
      host: `smtp.mailgun.org`,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_SMTP_USER || `postmaster@${process.env.MAILGUN_DOMAIN}`,
        pass: process.env.MAILGUN_API_KEY
      }
    });
  } else if (EMAIL_USER && EMAIL_PASSWORD) {
    // SMTP configuration (Gmail, custom SMTP, etc.)
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // For development only
      }
    });
  } else {
    // Email service not configured - this is OK, invitations will still work in-app
    // Only return null, don't log warnings during server startup
    return null;
  }

  return transporter;
};

// Verify email configuration
const verifyEmailConfig = async () => {
  const transporter = createTransporter();
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Email service configured and ready');
    return true;
  } catch (error) {
    console.error('❌ Email service verification failed:', error.message);
    return false;
  }
};

// Send invitation email
export const sendInvitationEmail = async (invitation, project, inviterName = '') => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn('Email service not configured. Skipping email send.');
      return { success: false, error: 'Email service not configured' };
    }

    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/collaborators`;
    const projectTitle = project.title || 'Untitled Project';
    const inviter = inviterName || invitation.inviterEmail;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Project Collaboration Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🧠 MindMesh</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">You've been invited to collaborate!</h2>
            
            <p>Hi there,</p>
            
            <p><strong>${inviter}</strong> has invited you to collaborate on the project:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin: 0; color: #667eea;">${projectTitle}</h3>
              ${project.description ? `<p style="color: #666; margin: 10px 0 0 0;">${project.description}</p>` : ''}
            </div>
            
            ${invitation.message ? `
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>Message from ${inviter}:</strong></p>
                <p style="margin: 10px 0 0 0; color: #856404;">${invitation.message}</p>
              </div>
            ` : ''}
            
            <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #004085;"><strong>Role:</strong> ${invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                View Invitation
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              To accept this invitation, log in to MindMesh and go to the Collaborators page.
              This invitation will expire in 30 days.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              This is an automated message from MindMesh. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    const textContent = `
🧠 MindMesh - Collaboration Invitation

Hi there,

${inviter} has invited you to collaborate on the project: ${projectTitle}

${project.description ? `Description: ${project.description}` : ''}

${invitation.message ? `Message from ${inviter}: ${invitation.message}` : ''}

Role: ${invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}

To accept this invitation, visit: ${invitationUrl}

This invitation will expire in 30 days.

---
This is an automated message from MindMesh. Please do not reply to this email.
    `.trim();

    const mailOptions = {
      from: `"MindMesh" <${EMAIL_FROM}>`,
      to: invitation.inviteeEmail,
      subject: `🧠 You've been invited to collaborate on "${projectTitle}"`,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Invitation email sent to ${invitation.inviteeEmail}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return { success: false, error: error.message };
  }
};

// Verify email configuration on module load (non-blocking)
// Only verify if email credentials are provided
if (process.env.NODE_ENV !== 'test') {
  // Delay verification to avoid blocking server startup
  setTimeout(() => {
    if (EMAIL_USER || process.env.SENDGRID_API_KEY || process.env.MAILGUN_API_KEY) {
      verifyEmailConfig().catch(err => {
        console.error('Email verification error:', err);
      });
    }
  }, 1000);
}

export default {
  sendInvitationEmail,
  verifyEmailConfig,
  createTransporter
};

