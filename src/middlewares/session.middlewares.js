import * as bcrypt from "bcrypt";
import { selectIdUsernameEmailPasswordByUsername } from "../models/Session.js";
import { errorResponse } from "../services/responses/error.responses.js";
import { validateStringField } from "../services/validators/fieldFormat.validators.js"
import { validatePassword } from "../services/validators/password.validators.js";
import { validateUsername } from "../services/validators/username.validators.js";
import jsonwebtoken from "jsonwebtoken";

const { verify, decode } = jsonwebtoken;

export const validadeLoginInput = (req, res, next) => {
    const username = req.body.username;
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

export const checkLoginPreviousConditions = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    let recuperedPassword;

    const checkAccountExistence = await selectIdUsernameEmailPasswordByUsername(username);

    if (checkAccountExistence.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, checkAccountExistence));
        return;
    } else if (!checkAccountExistence.rows[0]) {
        res.status(401);
        res.json(errorResponse(401, "usuario e/ou senha incorretos"));
        return;
    };

    req.body.account_id = checkAccountExistence.rows[0].id;
    req.body.email = checkAccountExistence.rows[0].email;
    recuperedPassword = checkAccountExistence.rows[0].password;

    const passwordCompareresult = bcrypt.compareSync(password, recuperedPassword);

    if (passwordCompareresult !== true) {
        res.status(401);
        res.json(errorResponse(401, "usuario e/ou senha incorretos"));
        return;
    };

    next();
};

export const validadeRefreshTokenInput = (req, res, next) => {
    const cookieHeader = req.headers.cookie;
    const cookies = cookieHeader ? (
        Object.fromEntries(
            cookieHeader.split('; ').map(cookie => {
                const [name, ...rest] = cookie.split('=');
                return [name, rest.join('=')];
            })
        )
    ) : {};

    const refreshToken = cookies.refresh_token;

    let inputErrors = [];

    if (!refreshToken) {
        inputErrors.push({ refresh_token: "O cookie 'refresh_token' é obrigatório" });
    } else {
        let validRefreshToken = validateStringField(refreshToken, 'refresh_token');
        if (validRefreshToken != 'validString') {
            inputErrors.push(validRefreshToken);
        };
    };

    if (inputErrors.length > 0) {
        res.status(422);
        res.json(errorResponse(422, inputErrors));
        return;
    };

    req.body.cookies = cookies;

    next();
};

export const checkRefreshTokenPreviousConditions = (req, res, next) => {
    const refreshToken = req.body.cookies.refresh_token;

    try {
        verify(refreshToken, process.env.JWT_REFRESH_TOKEN_KEY);
    } catch (error) {
        res.status(401);
        res.json(errorResponse(401, "'refresh_token' expirado ou inválido"));
        return;
    };

    const decodedRefreshToken = decode(refreshToken, process.env.JWT_REFRESH_TOKEN_KEY);

    req.body.account_id = decodedRefreshToken.account_id;
    req.body.username = decodedRefreshToken.username;

    next();
};