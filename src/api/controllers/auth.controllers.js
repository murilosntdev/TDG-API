import * as bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { insertIntoBearerTokenBlacklist, insertIntoRefreshToken, updatePasswordByAccountId, updatePasswordResetTokenRevokedByAccountId, updateRevokedByAccountId } from "../../core/models/Auth.js";
import { errorResponse } from "../services/responses/error.responses.js";
import { successResponse } from "../services/responses/success.responses.js";
import { createResetPasswordToken } from "../services/auth/tokenCreator.js";
import { sendMail } from "../../core/email/email.js";

const { sign } = jsonwebtoken;

export const login = async (req, res) => {
    const username = req.body.username;
    const account_id = req.auth.account_id;
    const email = req.auth.email;

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
        "result": "Access Granted",
        "account_info": {
            "username": username,
            "email": email
        }
    };

    res.status(200);
    res.cookie('bearer_token', jwtBearerToken, { httpOnly: false, secure: true, sameSite: 'None', domain: process.env.SYSTEM_BASE_DOMAIN, maxAge: 10800000, path: '/' });
    res.cookie('refresh_token', refreshToken.rows[0].token, { httpOnly: true, secure: true, sameSite: 'None', domain: process.env.SYSTEM_BASE_DOMAIN, maxAge: 2592000000, path: '/' });
    res.json(successResponse(200, responseDetail));
    return;
};

export const refreshToken = async (req, res) => {
    const account_id = req.auth.account_id;
    const username = req.auth.username;

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

    res.status(204);
    res.cookie('bearer_token', jwtBearerToken, { httpOnly: false, secure: true, sameSite: 'None', domain: process.env.SYSTEM_BASE_DOMAIN, maxAge: 10800000, path: '/' });
    res.cookie('refresh_token', refreshToken.rows[0].token, { httpOnly: true, secure: true, sameSite: 'None', domain: process.env.SYSTEM_BASE_DOMAIN, maxAge: 2592000000, path: '/' });
    res.json(successResponse(204));
    return;
};

export const logout = async (req, res) => {
    const bearerToken = req.cookies.bearer_token;
    const expiration = req.auth.expiration;
    const account_id = req.auth.account_id;

    const bearerTokenBlacklist = await insertIntoBearerTokenBlacklist(bearerToken, expiration);

    if (bearerTokenBlacklist.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, bearerTokenBlacklist));
        return;
    };

    const revokePreviousRefreshToken = await updateRevokedByAccountId(account_id);

    if (revokePreviousRefreshToken.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, revokePreviousRefreshToken));
        return;
    };

    res.status(204);
    res.cookie('bearer_token', '', { httpOnly: false, secure: true, sameSite: 'None', expires: new Date(0), path: '/' });
    res.cookie('refresh_token', '', { httpOnly: true, secure: true, sameSite: 'None', expires: new Date(0), path: '/' });
    res.json(successResponse(204));
};

export const passwordReset = async (req, res) => {
    const email = req.body.email;
    const account_id = req.auth.account_id;
    const username = req.auth.username;

    const revokePreviousPasswordResetToken = await updatePasswordResetTokenRevokedByAccountId(account_id);

    if (revokePreviousPasswordResetToken.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, revokePreviousPasswordResetToken));
        return;
    };

    const token = await createResetPasswordToken(account_id);

    if (token.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, token));
        return;
    };

    const templateContext = {
        name: username,
        passwordResetLink: `https://${process.env.SPA_BASE_DOMAIN}/password-reset?token=${token}`
    };

    const emailResult = await sendMail(email, 'Redefina sua senha', 'passwordReset', templateContext);

    if (emailResult.emailError) {
        await updatePasswordResetTokenRevokedByAccountId(account_id);
        res.status(503);
        res.json(errorResponse(503, null, emailResult));
        return;
    };

    const responseDetail = {
        "result": "Email sent",
        "account_info": {
            "email": email
        }
    };

    res.status(201);
    res.json(successResponse(201, responseDetail));
    return;
};

export const patchPasswordReset = async (req, res) => {
    const account_id = req.auth.account_id;
    const newPassword = req.body.new_password;

    const revokePasswordResetToken = await updatePasswordResetTokenRevokedByAccountId(account_id);

    if (revokePasswordResetToken.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, revokePasswordResetToken));
        return;
    };

    const hashPassword = await bcrypt.hash(newPassword, 10);
    const insertData = await updatePasswordByAccountId(hashPassword, account_id);

    if (insertData.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, insertData));
        return;
    };

    res.status(204).json(successResponse(204));
    return;
};