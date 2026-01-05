import { validateField } from "../../../core/validation/fieldValidator.js";
import { validateUsername } from "../../../core/validation/validators/username.js";
import { validatePassword } from "../../../core/validation/validators/password.js";
import { validateEmail } from "../../../core/validation/validators/email.js";
import { errorResponse } from "../../services/responses/error.responses.js";

export const validadeLoginInput = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    let inputErrors = [];

    const usernameError = validateField(username, validateUsername, "username");
    const passwordError = validateField(password, validatePassword, "password");

    if (usernameError) inputErrors.push(usernameError);
    if (passwordError) inputErrors.push(passwordError);

    if (inputErrors.length > 0) {
        res.status(422).json(errorResponse(422, inputErrors));
        return;
    };

    next();
};

export const validatePasswordResetInput = (req, res, next) => {
    const email = req.body.email;

    let inputErrors = [];

    const emailError = validateField(email, validateEmail, "email");

    if (emailError) inputErrors.push(emailError);

    if (inputErrors.length > 0) {
        res.status(422).json(errorResponse(422, inputErrors));
        return;
    };

    next();
};