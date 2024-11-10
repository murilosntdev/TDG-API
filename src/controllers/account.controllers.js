import * as bcrypt from "bcrypt";
import { insertIntoAccount } from "../models/Account.js";
import { successResponse } from "../services/responses/success.responses.js";
import { errorResponse } from "../services/responses/error.responses.js";

export const newAccount = async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const hashPassword = bcrypt.hashSync(password, 10);

    const insertData = await insertIntoAccount(username, email, hashPassword);

    if (insertData.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, insertData));
        return;
    };

    const responseDetail = {
        "result": "Usuario criado com sucesso",
        "account_info": {
            "username": insertData.rows[0].username,
            "email": insertData.rows[0].email
        }
    };

    res.status(201);
    res.json(successResponse(201, responseDetail));
    return;
};