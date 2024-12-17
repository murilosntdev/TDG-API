import { Router } from "express";
import { checkInfosPreviousConditions, checkNewAccountPreviousConditions, validadeInfosInput, validateNewAccountInput } from "../middlewares/account.middlewares.js";
import { infos, newAccount } from "../controllers/account.controllers.js";

const accountRouter = Router();

accountRouter.post('/new', validateNewAccountInput, checkNewAccountPreviousConditions, newAccount);
accountRouter.get('/infos', validadeInfosInput, checkInfosPreviousConditions, infos);

export default accountRouter;