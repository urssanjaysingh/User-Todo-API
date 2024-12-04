const nodemailer = require("nodemailer");
const {
    NODEMAILER_HOST,
    NODEMAILER_PORT,
    NODEMAILER_USER,
    NODEMAILER_PASS,
} = require("../config");

const emailTransporter = () => {
    return nodemailer.createTransport({
        host: NODEMAILER_HOST,
        port: NODEMAILER_PORT,
        secure: true,
        auth: {
            user: NODEMAILER_USER,
            pass: NODEMAILER_PASS,
        },
    });
};

async function sendWelcomeEmail(emailId) {
    const transporter = emailTransporter();

    const mailOptions = {
        from: NODEMAILER_USER,
        to: emailId,
        subject: "Welcome To Todo Application",
        html: `<p>Hi there,</p><p>Welcome to Todo Application! Your Account is Created Successfully!</p>`,
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully.");
    } catch (error) {
        console.log("Email sending failed with error: ", error);
    }
}

async function sendForgotPasswordEmail(email, tempPassword) {
    const transporter = emailTransporter();

    const mailOptions = {
        from: NODEMAILER_USER,
        to: email,
        subject: "Password Reset Request",
        html: `
            <p>Hi,</p>
            <p>Your password reset request was successful. Use the temporary password below to log in:</p>
            <p><strong>${tempPassword}</strong></p>
            <p>Please change your password after logging in.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendWelcomeEmail, sendForgotPasswordEmail };
