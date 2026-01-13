import { Router } from "express";
import { validadeLoginInput, validatePasswordResetInput, validatePatchPasswordResetInput } from "../../middlewares/auth/input.js";
import { checkLoginPreviousConditions, checkLogoutPreviousConditions, checkPasswordResetPreviousConditions, checkPatchPasswordResetPreviousConditions, checkRefreshTokenPreviousConditions } from "../../middlewares/auth/conditions.js";
import { login, logout, passwordReset, patchPasswordReset, refreshToken } from "../../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/login", validadeLoginInput, checkLoginPreviousConditions, login);
authRouter.post("/refresh-token", checkRefreshTokenPreviousConditions, refreshToken);
authRouter.post("/logout", checkLogoutPreviousConditions, logout);
authRouter.post("/password-reset", validatePasswordResetInput, checkPasswordResetPreviousConditions, passwordReset);
authRouter.patch("/password-reset", validatePatchPasswordResetInput, checkPatchPasswordResetPreviousConditions, patchPasswordReset);

export default authRouter;