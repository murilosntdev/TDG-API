import { dbExecute } from "../database/db.js";

export const selectIdUsernameEmailPasswordByUsername = async (username) => {
    let query = "SELECT id, username, email, password FROM account WHERE (username = $1)";
    let result = await dbExecute(query, [username]);

    return (result);
};

export const updateRevokedByAccountId = async (account_id) => {
    let query = "UPDATE refresh_token SET revoked = true WHERE (account_id = $1) AND (revoked = false)";
    let result = await dbExecute(query, [account_id]);

    return (result);
};

export const insertIntoRefreshToken = async (account_id, token) => {
    let expiration = new Date();
    expiration.setTime(expiration.getTime() + 30 * 24 * 60 * 60 * 1000);

    let query = "INSERT INTO refresh_token (account_id, token, expiration) VALUES ($1, $2, $3) RETURNING token";
    let result = await dbExecute(query, [account_id, token, expiration]);

    return (result);
};

export const insertIntoBearerTokenBlacklist = async (token, expiration) => {
    let query = "INSERT INTO bearer_token_blacklist (token, expiration) VALUES ($1, TO_TIMESTAMP($2)) RETURNING token";
    let result = await dbExecute(query, [token, expiration]);

    return (result);
};

export const selectIdByToken = async (token) => {
    let query = "SELECT id FROM bearer_token_blacklist WHERE (token = $1)";
    let result = await dbExecute(query, [token]);

    return (result);
};