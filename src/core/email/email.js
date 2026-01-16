import * as nodemailer from "nodemailer";
import path from "path";
import hbs from "nodemailer-express-handlebars";
import { fileURLToPath } from "url";

console.log("--- [EMAIL.JS LOG] INICIANDO O MÓDULO DE EMAIL ---");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsPath = path.join(__dirname, "views");

console.log(`--- [EMAIL.JS LOG] __filename: ${__filename}`);
console.log(`--- [EMAIL.JS LOG] __dirname: ${__dirname}`);
console.log(`--- [EMAIL.JS LOG] viewsPath final: ${viewsPath}`);

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
        layoutsDir: viewsPath,
        partialsDir: viewsPath,
        defaultLayout: false
    },
    viewPath: viewsPath,
    extName: ".handlebars"
};

smtp.use("compile", hbs(handleBarsOptions));

export const sendMail = (recipientEmail, subject, template, context) => {
    console.log("--- [EMAIL.JS LOG] Função sendMail foi chamada. ---");
    const configEmail = {
        from: `Truco da Galera <${process.env.NODEMAILER_USER}>`,
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
            console.log("--- [EMAIL.JS LOG] ERRO DENTRO DO SENDMAIL ---");
            console.error(error);
            const errorContent = {};
            errorContent.emailError = error;
            response(errorContent);
            smtp.close();
        });
    });
};