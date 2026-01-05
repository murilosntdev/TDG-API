import * as bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { cookiesExtractor } from "../../../core/auth/cookiesExtractor.js";
import { selectIdByToken, selectCredentialsByEmail, selectCredentialsByUsername, selectPasswordResetTokenIdExpirationByAccountId } from "../../../core/models/Auth.js";
import { errorResponse } from "../../services/responses/error.responses.js";

const { verify, decode } = jsonwebtoken;

export const checkLoginPreviousConditions = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    let recuperedPassword;

    const checkAccountExistence = await selectCredentialsByUsername(username);

    if (checkAccountExistence.dbError) {
        res.status(503).json(errorResponse(503, null, checkAccountExistence));
        return;
    } else if (!checkAccountExistence.rows[0]) {
        res.status(401).json(errorResponse(401, "Incorrect username and/or password"));
        return;
    };

    recuperedPassword = checkAccountExistence.rows[0].password;

    const passwordCompareresult = bcrypt.compareSync(password, recuperedPassword);

    if (passwordCompareresult !== true) {
        res.status(401).json(errorResponse(401, "Incorrect username and/or password"));
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
        res.status(401).json(errorResponse(401, "The 'refresh_token' cookie is required"));
        return;
    };

    try {
        verify(refreshToken, process.env.JWT_REFRESH_TOKEN_KEY);
    } catch (error) {
        res.status(401).json(errorResponse(401, "'refresh_token' is expired or invalid"));
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
        res.status(401).json(errorResponse(401, "The 'refresh_token' cookie is required"));
        return;
    };

    try {
        verify(bearerToken, process.env.JWT_BEARER_TOKEN_KEY);
    } catch (error) {
        res.status(401).json(errorResponse(401, "'refresh_token' is expired or invalid"));
        return;
    };

    const verifyBlacklist = await selectIdByToken(bearerToken);

    if (verifyBlacklist.dbError) {
        res.status(503).json(errorResponse(503, null, verifyBlacklist));
        return;
    };

    if (verifyBlacklist.rows[0]) {
        res.status(401).json(errorResponse(401, "'refresh_token' is expired or invalid"));
        return;
    };

    const decodedBearerToken = decode(bearerToken, process.env.JWT_BEARER_TOKEN_KEY);

    if (!req.auth) req.auth = {};
    req.auth.account_id = decodedBearerToken.account_id;
    req.auth.expiration = decodedBearerToken.exp;

    next();
};

export const checkPasswordResetPreviousConditions = async (req, res, next) => {
    const email = req.body.email;

    const checkAccountExistence = await selectCredentialsByEmail(email);

    if (checkAccountExistence.dbError) {
        res.status(503).json(errorResponse(503, null, checkAccountExistence));
        return;
    } else if (!checkAccountExistence.rows[0]) {
        res.status(404).json(errorResponse(404, "No account is associated with this email"));
        return;
    };

    const checkTokenExistence = await selectPasswordResetTokenIdExpirationByAccountId(checkAccountExistence.rows[0].id);

    if (checkTokenExistence.dbError) {
        res.status(503).json(errorResponse(503, null, checkTokenExistence));
        return;
    };

    const actualTime = new Date();
    actualTime.setTime(actualTime.getTime());

    if (checkTokenExistence.rows[0] && checkTokenExistence.rows[0].expiration > actualTime) {
        res.status(400);
        res.json(errorResponse(400, "There is still an active reset link for the account provided"));
        return;
    };

    if (!req.auth) req.auth = {};
    req.auth.account_id = checkAccountExistence.rows[0].id;
    req.auth.username = checkAccountExistence.rows[0].username;

    next();
};