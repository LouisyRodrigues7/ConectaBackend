
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "../models/User.js";



export const signup = async (req, res) => {
  try {
    console.log("POST /api/users/signup body:", req.body);

    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType) {
      return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "E-mail já cadastrado!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const secret = speakeasy.generateSecret({ name: `ConectaBus (${email})` });

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userType,
      secret: secret.base32,
      isMFAEnabled: true
    });

    // Gera o QR Code em Base64
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso!",
      qrCodeUrl
    });
  } catch (error) {
    console.error("❌ Erro no signup controller:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao cadastrar usuário",
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log("POST /api/users/login body:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "E-mail e senha são obrigatórios!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Usuário não encontrado!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Senha incorreta!" });
    }

    // Indica ao front que precisa do token MFA
    return res.status(200).json({
      success: true,
      requireToken: true,
      email,
      message: "Senha correta. Digite o código MFA."
    });
  } catch (error) {
    console.error("❌ Erro no login controller:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao fazer login",
      error: error.message
    });
  }
};

export const verifyMFA = async (req, res) => {
  try {
    console.log("POST /api/users/verify-mfa body:", req.body);

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
    console.error("❌ Erro no verifyMFA controller:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao verificar código MFA",
      error: error.message
    });
  }
};
