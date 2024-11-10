import { selectIdByEmail, selectIdByUsername } from "../models/Account.js";
import { errorResponse } from "../services/responses/error.responses.js";
import { validateEmail } from "../services/validators/email.validators.js";
import { validatePassword } from "../services/validators/password.validators.js";
import { validateUsername } from "../services/validators/username.validators.js";

export const validateNewAccountInput = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    let inputErrors = [];

    if (!username) {
        inputErrors.push({ username: "O campo 'username' é obrigatório" });
    } else {
        let validUsername = validateUsername(username, "username");
        if (validUsername != "validUsername") {
            inputErrors.push(validUsername);
        };
    };

    if (!email) {
        inputErrors.push({ email: "O campo 'email' é obrigatório" });
    } else {
        let validEmail = validateEmail(email, "email");
        if (validEmail != "validEmail") {
            inputErrors.push(validEmail);
        };
    };

    if (!password) {
        inputErrors.push({ password: "O campo 'password' é obrigatório" });
    } else {
        let validPassword = validatePassword(password, "password");
        if (validPassword != "validPassword") {
            inputErrors.push(validPassword);
        };
    };

    if (inputErrors.length > 0) {
        res.status(422);
        res.json(errorResponse(422, inputErrors));
        return;
    };

    next();
};

export const checkNewAccountPreviousConditions = async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;

    const checkUsernameExistence = await selectIdByUsername(username);

    if (checkUsernameExistence.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, checkUsernameExistence));
        return;
    } else if (checkUsernameExistence.rows[0]) {
        res.status(409);
        res.json(errorResponse(409, "Este username já está em uso"));
        return;
    };

    const checkEmailExistence = await selectIdByEmail(email);

    if (checkEmailExistence.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, checkEmailExistence));
        return;
    } else if (checkEmailExistence.rows[0]) {
        res.status(409);
        res.json(errorResponse(409, "Este email já está em uso"));
        return;
    };

    next();
};