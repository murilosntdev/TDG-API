import { selectIdByToken } from "../models/Auth.js";
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