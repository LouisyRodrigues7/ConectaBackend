import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(password);
}

// ====================================================================
//  CADASTRO COM ENVIO DE E-MAIL DE VERIFICAÇÃO
// ====================================================================
export const signup = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType)
      return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios!" });

    if (!isValidEmail(email))
      return res.status(400).json({ success: false, message: "E-mail inválido!" });

    if (!isStrongPassword(password))
      return res.status(400).json({
        success: false,
        message: "A senha deve ter ao menos 8 caracteres, uma letra maiúscula e um número."
      });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "E-mail já cadastrado!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userType,
      emailToken,
      isVerified: false
    });

    const verificationLink = `http://localhost:3000/api/users/verify-email/${emailToken}`;

    await sendEmail(
      email,
      "Verifique seu e-mail - ConectaBus",
      `
      <h2>Bem-vindo ao ConectaBus, ${name}!</h2>
      <p>Para ativar sua conta, clique no link abaixo:</p>
      <a href="${verificationLink}" target="_blank">${verificationLink}</a>
      <br><br>
      <p>Se você não criou esta conta, ignore este e-mail.</p>
      `
    );

    res.status(201).json({
      success: true,
      message: "Usuário criado! Verifique seu e-mail antes de continuar."
    });
  } catch (error) {
    console.error("❌ Erro no signup:", error);
    res.status(500).json({ success: false, message: "Erro ao cadastrar usuário." });
  }
};

// ====================================================================
//  VERIFICAR E-MAIL E GERAR QR CODE DO AUTHENTICATOR
// ====================================================================
export const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ emailToken: token });
    if (!user) return res.status(400).json({ success: false, message: "Token inválido." });

    const secret = speakeasy.generateSecret({ name: `ConectaBus (${user.email})` });
    const backupCode = crypto.randomBytes(4).toString("hex");

    user.emailToken = null;
    user.isVerified = true;
    user.secret = secret.base32;
    user.isMFAEnabled = true;
    user.backupCode = backupCode;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      message: "E-mail verificado! Configure seu Authenticator.",
      qrCodeUrl,
      backupCode
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao verificar e-mail." });
  }
};

// ====================================================================
// LOGIN - senha + autenticação MFA
// ====================================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ success: false, message: "Usuário não encontrado!" });

    if (!user.isVerified)
      return res.status(400).json({ success: false, message: "E-mail ainda não verificado." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Senha incorreta!" });

    if (!user.secret)
      return res.status(400).json({ success: false, message: "MFA ainda não configurado para este usuário." });

    // Tudo ok: senha correta, MFA configurado
    res.status(200).json({
      success: true,
      requireMFA: true,
      email,
      message: "Senha verificada. Insira o código do seu Authenticator para continuar."
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ success: false, message: "Erro ao fazer login." });
  }
};

// ====================================================================
//  ENVIAR NOVO CÓDIGO MFA POR E-MAIL
// ====================================================================
export const sendMFACode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });

    const tempMFACode = Math.floor(100000 + Math.random() * 900000).toString();
    user.tempMFACode = tempMFACode;
    user.tempMFACodeExp = Date.now() + 1000 * 60 * 5;
    await user.save();

    await sendEmail(
      email,
      "Seu novo código de verificação - ConectaBus",
      `
      <h3>Olá, ${user.name}</h3>
      <p>Seu novo código de autenticação é:</p>
      <h2>${tempMFACode}</h2>
      <p>Ele expira em 5 minutos.</p>
      `
    );

    res.status(200).json({ success: true, message: "Novo código MFA enviado por e-mail." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao enviar novo código MFA." });
  }
};

// ====================================================================
//  VERIFICAR MFA (Authenticator OU código por e-mail)
// ====================================================================
export const verifyMFA = async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Usuário não encontrado!" });

    const verifiedTOTP = speakeasy.totp.verify({
      secret: user.secret,
      encoding: "base32",
      token
    });

    const verifiedEmailCode =
      user.tempMFACode === token && user.tempMFACodeExp > Date.now();

    if (verifiedTOTP || verifiedEmailCode) {
      user.tempMFACode = undefined;
      user.tempMFACodeExp = undefined;
      await user.save();

      return res.status(200).json({ success: true, message: "Login bem-sucedido!" });
    }

    res.status(400).json({ success: false, message: "Código MFA inválido ou expirado!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao verificar MFA." });
  }
};

// ====================================================================
//  ESQUECI MINHA SENHA
// ====================================================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Usuário não encontrado!" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExp = Date.now() + 1000 * 60 * 10;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Redefinir senha - ConectaBus",
      `
      <h3>Olá, ${user.name}</h3>
      <p>Você solicitou uma redefinição de senha.</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      `
    );

    res.status(200).json({ success: true, message: "Link de redefinição enviado para o e-mail." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao gerar token de recuperação." });
  }
};

// ====================================================================
//  RESETAR SENHA
// ====================================================================
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExp: { $gt: Date.now() }
    });
    if (!user)
      return res.status(400).json({ success: false, message: "Token inválido ou expirado." });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Senha redefinida com sucesso!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao redefinir senha." });
  }
};

// ====================================================================
//  RECUPERAR MFA (backup code)
// ====================================================================
export const recoverMFA = async (req, res) => {
  try {
    const { email, backupCode } = req.body;
    const user = await User.findOne({ email, backupCode });
    if (!user)
      return res.status(400).json({ success: false, message: "Código de recuperação inválido." });

    res.status(200).json({
      success: true,
      message: "MFA recuperado. Faça login novamente e configure novo QR."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao recuperar MFA." });
  }
};
