const nodeMailer = require('nodemailer');

const sendMail = async (options) => {
    try {
        // Create a transporter using nodemailer
        const transporter = nodeMailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            service: process.env.SMPT_SERVICE,
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD,
            },
        });

        // Define the mail options
        const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email. Please check your configuration.");
    }
};

module.exports = sendMail;
