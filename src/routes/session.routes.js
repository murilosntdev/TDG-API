import { Router } from "express";
import { checkLoginPreviousConditions, checkLogoutPreviousConditions, checkRefreshTokenPreviousConditions, validadeLoginInput } from "../middlewares/session.middlewares.js";
import { login, logout, refreshToken } from "../controllers/session.controllers.js";

const sessionRouter = Router();

sessionRouter.post('/login', validadeLoginInput, checkLoginPreviousConditions, login);
sessionRouter.post('/refreshToken', checkRefreshTokenPreviousConditions, refreshToken);
sessionRouter.post('/logout', checkLogoutPreviousConditions, logout);

export default sessionRouter;