const axios = require('axios');

module.exports = {
  sendSms: async (phone, message) => {
    if (!process.env.SMS_RU_API_ID) {
      console.warn('SMS_RU_API_ID not set, SMS sending disabled');
      return;
    }
    
    try {
      const response = await axios.post('https://sms.ru/sms/send', null, {
        params: {
          api_id: process.env.SMS_RU_API_ID,
          to: phone,
          msg: message,
          json: 1
        }
      });
      
      if (response.data.status !== 'OK') {
        console.error('SMS sending error:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('SMS sending failed:', error.message);
    }
  }
};