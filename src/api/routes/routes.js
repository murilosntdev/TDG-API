import express from "express";
import accountRouter from "./account/index.js";
import sessionRouter from "./auth/index.js";

const router = express.Router();

router.use("/account", accountRouter);
router.use("/auth", sessionRouter);

export default router;