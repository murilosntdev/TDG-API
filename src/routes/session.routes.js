import { Router } from "express";
import { checkLoginPreviousConditions, checkLogoutPreviousConditions, checkRefreshTokenPreviousConditions, validadeLoginInput, validadeRefreshTokenInput, validateLogoutInput } from "../middlewares/session.middlewares.js";
import { login, logout, refreshToken } from "../controllers/session.controllers.js";

const sessionRouter = Router();

sessionRouter.post('/login', validadeLoginInput, checkLoginPreviousConditions, login);
sessionRouter.post('/refreshToken', validadeRefreshTokenInput, checkRefreshTokenPreviousConditions, refreshToken);
sessionRouter.post('/logout', validateLogoutInput, checkLogoutPreviousConditions, logout);

export default sessionRouter;