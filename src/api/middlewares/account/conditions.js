import { decode } from "jsonwebtoken";
import { selectIdByEmail, selectIdByUsername } from "../../models/Account.js";
import { cookiesExtractor } from "../../services/requests/cookiesExtractor.requests.js";
import { errorResponse } from "../../services/responses/error.responses.js";
import { bearerTokenChecker } from "../../services/token/checker.token.js";

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
    const validBearerToken = await bearerTokenChecker(bearerToken);

    if (validBearerToken !== 'validBearerToken') {
        res.status(validBearerToken.status);
        res.json(errorResponse(validBearerToken.status, validBearerToken.detail, validBearerToken.debugInfo));
        return;
    };

    const decodedBearerToken = decode(bearerToken, process.env.JWT_BEARER_TOKEN_KEY);

    if (req.query.username !== decodedBearerToken.username) {
        res.status(403);
        res.json(errorResponse(403, "Você não possúi permissão para acessar a entidade"));
        return;
    };

    req.body.account_id = decodedBearerToken.account_id;
    req.body.expiration = decodedBearerToken.exp;

    next();
};