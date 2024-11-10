import { Router } from "express";
import { checkLoginPreviousConditions, checkRefreshTokenPreviousConditions, validadeLoginInput, validadeRefreshTokenInput } from "../middlewares/session.middlewares.js";
import { login, refreshToken } from "../controllers/session.controllers.js";

const sessionRouter = Router();

sessionRouter.post('/login', validadeLoginInput, checkLoginPreviousConditions, login);
sessionRouter.post('/refreshToken', validadeRefreshTokenInput, checkRefreshTokenPreviousConditions, refreshToken);

export default sessionRouter;