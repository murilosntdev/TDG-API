import express from "express";
import accountRouter from "./account/index.js";
import authRouter from "./auth/index.js";

const router = express.Router();

router.use("/account", accountRouter);
router.use("/auth", authRouter);

export default router;