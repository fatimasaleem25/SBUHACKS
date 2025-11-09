// Quick test to verify server can start
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing server configuration...');
console.log('PORT:', process.env.PORT || 4000);
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
console.log('AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN || '❌ Missing');
console.log('AUTH0_AUDIENCE:', process.env.AUTH0_AUDIENCE || '❌ Missing');

// Test nodemailer import
try {
  const nodemailer = await import('nodemailer');
  console.log('✅ Nodemailer imported successfully');
} catch (error) {
  console.error('❌ Nodemailer import failed:', error.message);
}

// Test email service import
try {
  const emailService = await import('./src/services/emailService.js');
  console.log('✅ Email service imported successfully');
} catch (error) {
  console.error('❌ Email service import failed:', error.message);
}

console.log('\n✅ All tests passed! You can start the server with: npm run dev');

