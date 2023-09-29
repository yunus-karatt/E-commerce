const nodeMailer = require('nodemailer')

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000)
}


function sentOtp(email) {
  const otp = generateOtp()

  const transporter = nodeMailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP is: ${otp}`
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('OTP email sent:', info.response);
    }
  })
  return otp
}
module.exports = { sentOtp };