// src/routes/userRoutes.js
import express from "express";
import { signup, login, verifyMFA } from "../controllers/userController.js";

const router = express.Router();

// endpoints:
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-mfa", verifyMFA);

export default router;
