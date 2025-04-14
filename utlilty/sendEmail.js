const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"MailX Support" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subject,
        html: html
    });
};

module.exports = sendEmail;
