import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "../models/User.js";
import { generateRecoveryCodes } from "../utils/generateRecoveryCodes.js";

// REGEX DE VALIDAÇÃO
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;

export const signup = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType) {
      return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios!" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "E-mail inválido!" });
    }

    if (!senhaRegex.test(password)) {
      return res.status(400).json({ success: false, message: "Senha fraca!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "E-mail já cadastrado!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 Gerar 4 códigos de recuperação
    const { codes, hashedCodes } = generateRecoveryCodes();

    // Criar segredo MFA
    const secret = speakeasy.generateSecret({ name: `ConectaBus (${email})` });

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userType,
      secret: secret.base32,
      isMFAEnabled: true,
      recoveryCodes: hashedCodes // salva hashados
    });

    // Gerar QR Code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso!",
      qrCodeUrl,
      recoveryCodes: codes // retorna somente os reais
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao cadastrar usuário",
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "E-mail e senha obrigatórios!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Usuário não encontrado!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Senha incorreta!" });
    }

    return res.status(200).json({
      success: true,
      requireToken: true,
      email,
      message: "Senha correta. Digite o código MFA."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao fazer login",
      error: error.message
    });
  }
};

export const verifyMFA = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ success: false, message: "Email e token são obrigatórios!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Usuário não encontrado!" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: "base32",
      token
    });

    if (verified) {
      return res.status(200).json({
        success: true,
        message: "Login bem-sucedido!"
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Código MFA inválido!"
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao verificar MFA",
      error: error.message
    });
  }
};

// 🔥 NOVO — reset do MFA via código de recuperação
export const resetMFA = async (req, res) => {
  try {
    const { email, recoveryCode } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Usuário não encontrado!" });

    // Verifica os códigos
    const valid = user.recoveryCodes.some(hash => bcrypt.compareSync(recoveryCode, hash));
    if (!valid) {
      return res.status(400).json({ success: false, message: "Código de recuperação inválido!" });
    }

    // Gere novo segredo MFA
    const newSecret = speakeasy.generateSecret({ name: `ConectaBus (${email})` });

    user.secret = newSecret.base32;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(newSecret.otpauth_url);

    return res.json({
      success: true,
      message: "Novo QR Code gerado!",
      qrCodeUrl
    });

  } catch (e) {
    return res.status(500).json({ success: false, message: "Erro ao resetar MFA" });
  }
};

// 🔥 NOVO — reset de senha sem e-mail
export const resetPassword = async (req, res) => {
  try {
    const { email, recoveryCode, newPassword } = req.body;

    if (!senhaRegex.test(newPassword)) {
      return res.status(400).json({ success: false, message: "Senha fraca!" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Usuário não encontrado!" });

    const valid = user.recoveryCodes.some(hash => bcrypt.compareSync(recoveryCode, hash));
    if (!valid) {
      return res.status(400).json({ success: false, message: "Código de recuperação inválido!" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ success: true, message: "Senha alterada com sucesso!" });

  } catch (e) {
    return res.status(500).json({ success: false, message: "Erro ao resetar senha" });
  }
};
