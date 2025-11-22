import nodemailer from 'nodemailer';

// Create transporter based on environment
let transporter;

// For development: Use Ethereal (fake SMTP) or Gmail with App Password
// For production: Use your email service
const createTransporter = async () => {
  // If Gmail credentials are properly set, use them
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.length > 10) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Fallback to Ethereal for testing (creates temporary test account)
    console.log('⚠️  Using Ethereal test email service. Emails won\'t be actually sent.');
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

transporter = await createTransporter();

export async function sendPasswordResetEmail(email, resetCode, userName) {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Your App'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2C333A;
              margin: 0;
            }
            .reset-code {
              background-color: #101214;
              color: #C7D1DB;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
            }
            .info {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #2C333A;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              color: #e74c3c;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            
            <p>Hello ${userName},</p>
            
            <p>We received a request to reset your password. Use the code below to reset your password:</p>
            
            <div class="reset-code">
              ${resetCode}
            </div>
            
            <div class="info">
              <p><strong>Important:</strong></p>
              <ul>
                <li>This code will expire in <span class="warning">10 minutes</span></li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this code with anyone</li>
              </ul>
            </div>
            
            <p>If you're having trouble, please contact our support team.</p>
            
            <div class="footer">
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello ${userName},
        
        We received a request to reset your password. Use the code below to reset your password:
        
        Reset Code: ${resetCode}
        
        Important:
        - This code will expire in 10 minutes
        - If you didn't request this reset, please ignore this email
        - Never share this code with anyone
        
        If you're having trouble, please contact our support team.
      `,
    };

    // Recreate transporter if needed
    if (!transporter) {
      transporter = await createTransporter();
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: %s', info.messageId);
    
    // If using Ethereal, log the preview URL
    if (info.messageId && transporter.options?.host === 'smtp.ethereal.email') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('📧 Preview email: %s', previewUrl);
      return { success: true, messageId: info.messageId, previewUrl };
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}
