const nodemailer = require("nodemailer");

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_ENDPOINT,
    port: process.env.SMTP_PORT,
    secure: false, 
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
});

transporter.verify().then(() => {
    console.log('Ready for send emails');
})

