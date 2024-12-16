import * as bcrypt from "bcrypt";
import { selectIdByToken, selectIdUsernameEmailPasswordByUsername } from "../models/Session.js";
import { errorResponse } from "../services/responses/error.responses.js";
import { validatePassword } from "../services/validators/password.validators.js";
import { validateUsername } from "../services/validators/username.validators.js";
import jsonwebtoken from "jsonwebtoken";
import { cookiesExtractor } from "../services/requests/cookiesExtractor.requests.js";

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

export const checkRefreshTokenPreviousConditions = (req, res, next) => {
    cookiesExtractor(req);

    const refreshToken = req.body.cookies.refresh_token;

    if (!refreshToken) {
        res.status(401);
        res.json(errorResponse(401, "O cookie 'refresh_token' é obrigatório"));
        return;
    };

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

export const checkLogoutPreviousConditions = async (req, res, next) => {
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