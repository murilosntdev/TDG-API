import * as bcrypt from "bcrypt";
import { insertIntoAccount, selectInfosById } from "../models/Account.js";
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

export const infos = async (req, res) => {
    const account_id = req.body.account_id;

    const accountInfos = await selectInfosById(account_id);

    if (accountInfos.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, accountInfos));
        return;
    };


    if (!accountInfos.rows[0]) {
        res.status(404);
        res.json(errorResponse(404));
        return;
    };

    const responseDetail = {
        "account_info": {
            "username": accountInfos.rows[0].username,
            "email": accountInfos.rows[0].email
        }
    };

    res.status(200);
    res.json(successResponse(200, responseDetail));
    return;
};