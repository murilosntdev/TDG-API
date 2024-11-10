import { Router } from "express";
import { checkLoginPreConditions, validadeLoginInput } from "../middlewares/session.middlewares.js";
import { login } from "../controllers/session.controllers.js";

const sessionRouter = Router();

sessionRouter.post('/login', validadeLoginInput, checkLoginPreConditions, login);

export default sessionRouter;