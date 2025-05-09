import { Router } from "express";
import { validadeInfosInput, validateNewAccountInput } from "../../middlewares/account/input.js";
import { checkInfosPreviousConditions, checkNewAccountPreviousConditions } from "../../middlewares/account/conditions.js";
import { infos, newAccount } from "../../controllers/account.controllers.js";

const accountRouter = Router();

accountRouter.post('/new', validateNewAccountInput, checkNewAccountPreviousConditions, newAccount);
accountRouter.get('/infos', validadeInfosInput, checkInfosPreviousConditions, infos);

export default accountRouter;