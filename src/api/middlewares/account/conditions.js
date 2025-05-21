import { decode } from "jsonwebtoken";
import { cookiesExtractor } from "../../../core/auth/cookiesExtractor.js";
import { bearerTokenChecker } from "../../../core/auth/tokenChecker.js";
import { selectIdByEmail, selectIdByUsername } from "../../../core/models/Account.js";
import { errorResponse } from "../../services/responses/error.responses.js";

export const checkNewAccountPreviousConditions = async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;

    const checkUsernameExistence = await selectIdByUsername(username);

    if (checkUsernameExistence.dbError) {
        res.status(503).json(errorResponse(503, null, checkUsernameExistence));
        return;
    } else if (checkUsernameExistence.rows[0]) {
        res.status(409).json(errorResponse(409, "Este username já está em uso"));
        return;
    };

    const checkEmailExistence = await selectIdByEmail(email);

    if (checkEmailExistence.dbError) {
        res.status(503).json(errorResponse(503, null, checkEmailExistence));
        return;
    } else if (checkEmailExistence.rows[0]) {
        res.status(409).json(errorResponse(409, "Este email já está em uso"));
        return;
    };

    next();
};

export const checkInfosPreviousConditions = async (req, res, next) => {
    cookiesExtractor(req);

    const bearerToken = req.cookies.bearer_token;
    const validBearerToken = await bearerTokenChecker(bearerToken);

    if (validBearerToken !== 'validBearerToken') {
        res.status(validBearerToken.status).json(errorResponse(validBearerToken.status, validBearerToken.detail, validBearerToken.debugInfo));
        return;
    };

    const decodedBearerToken = decode(bearerToken, process.env.JWT_BEARER_TOKEN_KEY);

    if (req.query.username !== decodedBearerToken.username) {
        res.status(403).json(errorResponse(403, "Você não possúi permissão para acessar a entidade"));
        return;
    };

    if (!req.auth) req.auth = {};
    req.auth.account_id = decodedBearerToken.account_id;

    next();
};