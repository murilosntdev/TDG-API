import { Router } from "express";
import { validadeLoginInput } from "../../middlewares/auth/input.js";
import { checkLoginPreviousConditions, checkLogoutPreviousConditions, checkRefreshTokenPreviousConditions } from "../../middlewares/auth/conditions.js";
import { login, logout, refreshToken } from "../../controllers/session.controllers.js";

const sessionRouter = Router();

sessionRouter.post("/login", validadeLoginInput, checkLoginPreviousConditions, login);
sessionRouter.post("/refreshToken", checkRefreshTokenPreviousConditions, refreshToken);
sessionRouter.post("/logout", checkLogoutPreviousConditions, logout);

export default sessionRouter;