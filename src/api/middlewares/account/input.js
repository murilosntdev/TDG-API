import { validateField } from "../../../core/validation/fieldValidator.js";
import { validateUsername } from "../../../core/validation/validators/username.js";
import { validateEmail } from "../../../core/validation/validators/email.js";
import { validatePassword } from "../../../core/validation/validators/password.js";
import { errorResponse } from "../../services/responses/error.responses.js";

export const validateNewAccountInput = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    let inputErrors = [];

    const usernameError = validateField(username, validateUsername, "username");
    const emailError = validateField(email, validateEmail, "email");
    const passwordError = validateField(password, validatePassword, "password");

    if (usernameError) inputErrors.push(usernameError);
    if (emailError) inputErrors.push(emailError);
    if (passwordError) inputErrors.push(passwordError);

    if (inputErrors.length > 0) {
        res.status(422).json(errorResponse(422, inputErrors));
        return;
    };

    next();
};

export const validadeInfosInput = (req, res, next) => {
    const username = req.query.username;

    let inputErrors = [];

    const usernameError = validateField(username, validateUsername, "username");

    if (usernameError) inputErrors.push(usernameError);

    if (inputErrors.length > 0) {
        res.status(422).json(errorResponse(422, inputErrors));
        return;
    };

    next();
};