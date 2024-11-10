import { Router } from "express";
import { checkNewAccountPreviousConditions, validateNewAccountInput } from "../middlewares/account.middlewares.js";
import { newAccount } from "../controllers/account.controllers.js";

const accountRouter = Router();

accountRouter.post('/new', validateNewAccountInput, checkNewAccountPreviousConditions, newAccount);

export default accountRouter;