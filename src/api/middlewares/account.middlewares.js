import { selectIdByEmail, selectIdByUsername } from "../models/Account.js";
import { selectIdByToken } from "../models/Session.js";
import { cookiesExtractor } from "../services/requests/cookiesExtractor.requests.js";
import { errorResponse } from "../services/responses/error.responses.js";
import { validateEmail } from "../services/validators/email.validators.js";
import { validatePassword } from "../services/validators/password.validators.js";
import { validateUsername } from "../services/validators/username.validators.js";
import jsonwebtoken from "jsonwebtoken";

const { verify, decode } = jsonwebtoken;

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

export const checkInfosPreviousConditions = async (req, res, next) => {
    cookiesExtractor(req);

    const bearerToken = req.body.cookies.bearer_token;

    if (!bearerToken) {
        res.status(401);
        res.json(errorResponse(401, "O cookie 'bearer_token' é obrigatório"));
        return;
    };

    try {
        verify(bearerToken, process.env.JWT_BEARER_TOKEN_KEY);
    } catch (error) {
        res.status(401);
        res.json(errorResponse(401, "'bearer_token' expirado ou inválido"));
        return;
    };

    const verifyBlacklist = await selectIdByToken(bearerToken);

    if (verifyBlacklist.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, verifyBlacklist));
        return;
    };

    if (verifyBlacklist.rows[0]) {
        res.status(401);
        res.json(errorResponse(401, "'bearer_token' expirado ou inválido"));
        return;
    };

    const decodedBearerToken = decode(bearerToken, process.env.JWT_BEARER_TOKEN_KEY);

    req.body.account_id = decodedBearerToken.account_id;
    req.body.expiration = decodedBearerToken.exp;

    next();
};