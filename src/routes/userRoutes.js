import express from "express";
import {
  signup,
  verifyEmail,
  login,
  verifyMFA,
  forgotPassword,
  resetPassword,
  recoverMFA,
  sendMFACode 
} from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.get("/verify-email/:token", verifyEmail); 
router.post("/login", login);
router.post("/verify-mfa", verifyMFA);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/recover-mfa", recoverMFA);
router.post("/send-mfa-code", sendMFACode); 

export default router;
