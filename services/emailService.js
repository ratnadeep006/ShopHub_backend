const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send Reset Password Email
exports.sendResetEmail = async (email, resetToken, username) => {
  const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"ShopHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your ShopHub Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        
        <div style="background-color: #667eea; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🛍️ ShopHub</h1>
        </div>

        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello ${username}!</h2>
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password. 
            Click the button below to reset it.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a 
              href="${resetLink}" 
              style="
                background-color: #667eea;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 4px;
                font-size: 16px;
                font-weight: bold;
              "
            >
              Reset Password
            </a>
          </div>

          <p style="color: #666; line-height: 1.6;">
            Or copy this link in your browser:
          </p>
          <p style="
            background-color: #eee;
            padding: 10px;
            border-radius: 4px;
            word-break: break-all;
            font-size: 13px;
          ">
            ${resetLink}
          </p>

          <p style="color: #999; font-size: 13px;">
            ⚠️ This link will expire in <strong>1 hour</strong>.
          </p>

          <p style="color: #999; font-size: 13px;">
            If you didn't request this, please ignore this email.
            Your password will remain unchanged.
          </p>
        </div>

        <div style="
          background-color: #333;
          padding: 20px;
          text-align: center;
        ">
          <p style="color: #999; margin: 0; font-size: 13px;">
            © 2024 ShopHub. All rights reserved.
          </p>
        </div>

      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send Order Confirmation Email
exports.sendOrderConfirmationEmail = async (email, username, orderId) => {
  const mailOptions = {
    from: `"ShopHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmed! #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        
        <div style="background-color: #667eea; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🛍️ ShopHub</h1>
        </div>

        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Thank you ${username}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your order <strong>#${orderId}</strong> has been confirmed!
            We'll notify you when it ships.
          </p>

          <div style="
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          ">
            <p style="margin: 0; color: #333;">
              📦 Order ID: <strong>#${orderId}</strong>
            </p>
            <p style="margin: 10px 0 0; color: #666;">
              🚚 Estimated delivery: 2-3 business days
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a 
              href="http://localhost:3000/orders" 
              style="
                background-color: #667eea;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 4px;
                font-size: 16px;
                font-weight: bold;
              "
            >
              View Order
            </a>
          </div>
        </div>

        <div style="
          background-color: #333;
          padding: 20px;
          text-align: center;
        ">
          <p style="color: #999; margin: 0; font-size: 13px;">
            © 2024 ShopHub. All rights reserved.
          </p>
        </div>

      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};