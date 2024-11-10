import { dbExecute } from "../database/db.js";

export const selectIdByUsername = async (username) => {
    var query = "SELECT id FROM account WHERE (username = $1)";
    var result = await dbExecute(query, [username]);

    return (result);
};

export const selectIdByEmail = async (email) => {
    var query = "SELECT id FROM account WHERE (email = $1)";
    var result = await dbExecute(query, [email]);

    return (result);
};

export const insertIntoAccount = async (username, email, hashPassword) => {
    var query = "INSERT INTO account (username, email, password) VALUES ($1, $2, $3) RETURNING username, email";
    var result = await dbExecute(query, [username, email, hashPassword]);

    return (result);
};