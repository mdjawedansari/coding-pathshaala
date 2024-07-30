import nodemailer from "nodemailer";

// Function to send an email
const sendEmail = async (email, subject, message) => {
  try {
    // Create a reusable transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10), // Convert port to number
      secure: process.env.SMTP_PORT === '465', // true for port 465, false for other ports
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Define mail options
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL, // Sender address
      to: email, // Recipient address
      subject: subject, // Subject line
      html: message, // HTML body
    };

    // Send email with the defined transport object
    await transporter.sendMail(mailOptions);

    console.log(`Email sent to ${email} with subject: ${subject}`);
  } catch (error) {
    console.error(`Failed to send email: ${error.message}`);
    // Optionally, you might want to throw the error again or handle it accordingly
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmail;
