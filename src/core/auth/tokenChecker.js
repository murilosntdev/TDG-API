import { selectAccountIdExpirationByTokenHash, selectIdByToken } from "../models/Auth.js";
import crypto from 'crypto';
import jsonwebtoken from "jsonwebtoken";

const { verify } = jsonwebtoken;

export const bearerTokenChecker = async (bearerToken) => {
    const result = {};

    if (!bearerToken) {
        result.status = 401;
        result.detail = ["The 'bearer_token' cookie is required"];

        return (result);
    };

    try {
        verify(bearerToken, process.env.JWT_BEARER_TOKEN_KEY);
    } catch (error) {
        result.status = 401;
        result.detail = ["'bearer_token' is expired or invalid"];

        return (result);
    };

    const blacklistCheck = await selectIdByToken(bearerToken);

    if (blacklistCheck.dbError) {
        result.status = 503;
        result.debugInfo = blacklistCheck;

        return (result);
    };

    if (blacklistCheck.rows[0]) {
        result.status = 401;
        result.detail = ["'bearer_token' is expired or invalid"];

        return (result);
    };

    return ('validBearerToken');
};

export const headerTokenChecker = async (headerToken, tokenName) => {
    const result = {};

    if (!headerToken) {
        result.status = 401;
        result.detail = [`The '${tokenName}' header is required`];

        return (result);
    };

    const tokenHash = crypto.createHash('sha256').update(headerToken).digest('hex');
    const recuperedToken = await selectAccountIdExpirationByTokenHash(tokenHash);

    if (recuperedToken.dbError) {
        result.status = 503;
        result.debugInfo = recuperedToken;

        return (result);
    };

    var actualTime = new Date()
    actualTime.setTime(actualTime.getTime());

    if (!recuperedToken.rows[0] || actualTime > recuperedToken.rows[0].expiration) {
        result.status = 401;
        result.detail = [`'${tokenName}' is expired or invalid`];

        return (result);
    };

    return ({ status: 'validHeaderToken', account_id: recuperedToken.rows[0].account_id });
};