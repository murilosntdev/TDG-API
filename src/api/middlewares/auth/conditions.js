import * as bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { cookiesExtractor } from "../../../core/auth/cookiesExtractor.js";
import { selectIdByToken, selectIdUsernameEmailPasswordByUsername } from "../../../core/models/Auth.js";
import { errorResponse } from "../../services/responses/error.responses.js";

const { verify, decode } = jsonwebtoken;

export const checkLoginPreviousConditions = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    let recuperedPassword;

    const checkAccountExistence = await selectIdUsernameEmailPasswordByUsername(username);

    if (checkAccountExistence.dbError) {
        res.status(503).json(errorResponse(503, null, checkAccountExistence));
        return;
    } else if (!checkAccountExistence.rows[0]) {
        res.status(401).json(errorResponse(401, "usuario e/ou senha incorretos"));
        return;
    };

    recuperedPassword = checkAccountExistence.rows[0].password;
    
    const passwordCompareresult = bcrypt.compareSync(password, recuperedPassword);
    
    if (passwordCompareresult !== true) {
        res.status(401).json(errorResponse(401, "usuario e/ou senha incorretos"));
        return;
    };
    
    if (!req.auth) req.auth = {};
    req.auth.account_id = checkAccountExistence.rows[0].id;
    req.auth.email = checkAccountExistence.rows[0].email;
    
    next();
};

export const checkRefreshTokenPreviousConditions = (req, res, next) => {
    cookiesExtractor(req);

    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        res.status(401).json(errorResponse(401, "O cookie 'refresh_token' é obrigatório"));
        return;
    };

    try {
        verify(refreshToken, process.env.JWT_REFRESH_TOKEN_KEY);
    } catch (error) {
        res.status(401).json(errorResponse(401, "'refresh_token' expirado ou inválido"));
        return;
    };

    const decodedRefreshToken = decode(refreshToken, process.env.JWT_REFRESH_TOKEN_KEY);

    if (!req.auth) req.auth = {};
    req.auth.account_id = decodedRefreshToken.account_id;
    req.auth.username = decodedRefreshToken.username;

    next();
};

export const checkLogoutPreviousConditions = async (req, res, next) => {
    cookiesExtractor(req);

    const bearerToken = req.cookies.bearer_token;

    if (!bearerToken) {
        res.status(401).json(errorResponse(401, "O cookie 'bearer_token' é obrigatório"));
        return;
    };

    try {
        verify(bearerToken, process.env.JWT_BEARER_TOKEN_KEY);
    } catch (error) {
        res.status(401).json(errorResponse(401, "'bearer_token' expirado ou inválido"));
        return;
    };

    const verifyBlacklist = await selectIdByToken(bearerToken);

    if (verifyBlacklist.dbError) {
        res.status(503).json(errorResponse(503, null, verifyBlacklist));
        return;
    };

    if (verifyBlacklist.rows[0]) {
        res.status(401).json(errorResponse(401, "'bearer_token' expirado ou inválido"));
        return;
    };

    const decodedBearerToken = decode(bearerToken, process.env.JWT_BEARER_TOKEN_KEY);

    if (!req.auth) req.auth = {};
    req.auth.account_id = decodedBearerToken.account_id;
    req.auth.expiration = decodedBearerToken.exp;

    next();
};