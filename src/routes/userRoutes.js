import express from "express";
import {
  signup,
  login,
  verifyMFA,
  resetMFA,
  resetPassword
} from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-mfa", verifyMFA);

// 🔥 Novas rotas
router.post("/reset-mfa", resetMFA);
router.post("/reset-password", resetPassword);

export default router;
