import { Router } from "express";
import { validadeLoginInput, validatePasswordResetInput } from "../../middlewares/auth/input.js";
import { checkLoginPreviousConditions, checkLogoutPreviousConditions, checkPasswordResetPreviousConditions, checkRefreshTokenPreviousConditions } from "../../middlewares/auth/conditions.js";
import { login, logout, passwordReset, refreshToken } from "../../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/login", validadeLoginInput, checkLoginPreviousConditions, login);
authRouter.post("/refresh-token", checkRefreshTokenPreviousConditions, refreshToken);
authRouter.post("/logout", checkLogoutPreviousConditions, logout);
authRouter.post("/password-reset", validatePasswordResetInput, checkPasswordResetPreviousConditions, passwordReset);

export default authRouter;