import * as nodemailer from "nodemailer";
import path from "path";
import hbs from "nodemailer-express-handlebars";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const smtp = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: process.env.NODEMAILER_SECURE,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }
});

const handleBarsOptions = {
    viewEngine: {
        extName: ".handlebars",
        partialsDir: path.join(__dirname, "views"),
        defaultLayout: false
    },
    viewPath: path.join(__dirname, "views"),
    extName: ".handlebars"
};

smtp.use("compile", hbs(handleBarsOptions));

export const sendMail = (recipientEmail, subject, template, context) => {
    const configEmail = {
        from: `Truco da Galera <${process.env.NODEMAILER_HOST}>`,
        to: [recipientEmail],
        subject: subject,
        template: template,
        context: context
    };

    return new Promise((response) => {
        smtp.sendMail(configEmail).then(res => {
            response(res);
            smtp.close();
        }).catch(error => {
            const errorContent = {};
            errorContent.emailError = error;
            response(errorContent);
            smtp.close();
        });
    });
};