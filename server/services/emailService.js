const nodemailer = require('nodemailer');

// Создаем транспорт для отправки email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = {
  sendEmail: async (to, subject, text) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not set, email sending disabled');
      return;
    }
    
    try {
      await transporter.sendMail({
        from: `"HomeService Pro" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text
      });
    } catch (error) {
      console.error('Email sending failed:', error.message);
    }
  }
};