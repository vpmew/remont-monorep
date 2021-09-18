import express from "express";
import { login, viaSocialNetwork, logout } from "controllers/auth";

const router = express.Router();

router.post("/login", login);
router.post("/viaSocialNetwork", viaSocialNetwork);
router.post("/logout", logout);

export default router;
