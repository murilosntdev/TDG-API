import { selectIdByToken } from "../../models/Session.js";
import jsonwebtoken from "jsonwebtoken";

const { verify } = jsonwebtoken;

export const bearerTokenChecker = async (bearerToken) => {
    const result = {};

    if (!bearerToken) {
        result.status = 401;
        result.detail = ["O cookie 'bearer_token' é obrigatório"];

        return (result);
    };

    try {
        verify(bearerToken, process.env.JWT_BEARER_TOKEN_KEY);
    } catch (error) {
        result.status = 401;
        result.detail = ["'bearer_token' expirado ou inválido"];

        return (result);
    };

    const verifyBlacklist = await selectIdByToken(bearerToken);

    if (verifyBlacklist.dbError) {
        result.status = 503;
        result.debugInfo = verifyBlacklist;

        return (result);
    };

    if (verifyBlacklist.rows[0]) {
        result.status = 401;
        result.detail = ["'bearer_token' expirado ou inválido"];

        return (result);
    };

    return ('validBearerToken');
};