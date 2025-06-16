const twilio = require('twilio');
const nodemailer = require('nodemailer');

// Настройка SMS
const smsClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// Настройка email
const emailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendSMS = (to, message) => {
  return smsClient.messages.create({
    body: message,
    from: process.env.TWILIO_NUMBER,
    to
  });
};

exports.sendEmail = (to, subject, text) => {
  return emailTransport.sendMail({
    from: `HomeService <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  });
};

exports.sendPush = (userId, message) => {
  // Интеграция с Firebase Cloud Messaging
};