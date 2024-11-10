import jsonwebtoken from "jsonwebtoken";
import { insertIntoRefreshToken, updateRevokedByAccountId } from "../models/Session.js";
import { errorResponse } from "../services/responses/error.responses.js";
import { successResponse } from "../services/responses/success.responses.js";

const { sign } = jsonwebtoken;

export const login = async (req, res) => {
    const account_id = req.body.account_id;
    const username = req.body.username;
    const email = req.body.email;

    const revokePreviousRefreshToken = await updateRevokedByAccountId(account_id);

    if (revokePreviousRefreshToken.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, revokePreviousRefreshToken));
        return;
    };

    const jwtRefreshToken = sign(
        {
            account_id,
            username
        },
        process.env.JWT_REFRESH_TOKEN_KEY,
        {
            expiresIn: "30d"
        }
    );

    const refreshToken = await insertIntoRefreshToken(account_id, jwtRefreshToken);

    if (refreshToken.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, refreshToken));
        return;
    };

    const jwtBearerToken = sign(
        {
            account_id,
            username
        },
        process.env.JWT_BEARER_TOKEN_KEY,
        {
            expiresIn: "3h"
        }
    );

    const responseDetail = {
        "result": "Acesso Garantido",
        "account_info": {
            "username": username,
            "email": email
        }
    };

    res.status(200);
    res.cookie('bearer_token', jwtBearerToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 10800000, path: '/' });
    res.cookie('refresh_token', refreshToken.rows[0].token, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 2592000000, path: '/' });
    res.json(successResponse(200, responseDetail));
    return;
};