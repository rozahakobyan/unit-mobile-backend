import nodemailer from "nodemailer";

const { INFO_EMAIL, SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;

async function sendMassageToEmail(from, html, subject) {
    try {
        let  transporter = nodemailer.createTransport({
            direct: true,
            debug: true,
            host: SMTP_HOST,
            port: 587,
            secure: false,
            ignoreTLS: true,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });

        let mailOptions = {
            from: from,
            to: INFO_EMAIL,
            subject: subject,
            text: html
        };

        await transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        console.log('Massage email sent successfully!');
    } catch (error) {
        console.error('Error sending massage:', error);
    }
}

export default sendMassageToEmail;