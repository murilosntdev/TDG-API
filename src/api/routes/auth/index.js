import { Router } from "express";
import { validadeLoginInput } from "../../middlewares/auth/input.js";
import { checkLoginPreviousConditions, checkLogoutPreviousConditions, checkRefreshTokenPreviousConditions } from "../../middlewares/auth/conditions.js";
import { login, logout, refreshToken } from "../../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/login", validadeLoginInput, checkLoginPreviousConditions, login);
authRouter.post("/refresh-token", checkRefreshTokenPreviousConditions, refreshToken);
authRouter.post("/logout", checkLogoutPreviousConditions, logout);

export default authRouter;