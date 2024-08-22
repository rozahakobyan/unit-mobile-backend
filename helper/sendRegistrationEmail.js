import nodemailer from "nodemailer";

const { INFO_EMAIL, APP_PASS } = process.env;

async function sendRegistrationEmail(to,html) {
    try {
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: INFO_EMAIL,
                pass: APP_PASS,
            },
        });

        // Email content
        let mailOptions = {
            from: INFO_EMAIL,
            to: to,
            subject: 'History to Our Application',
            html: html
        
        };
   
        await transporter.sendMail(mailOptions);
        console.log('Registration email sent successfully!');
    } catch (error) {
        console.error('Error sending registration email:', error);       
    }
}

export default sendRegistrationEmail