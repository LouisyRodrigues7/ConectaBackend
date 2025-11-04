// src/controllers/userController.js
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "../models/User.js";

/*
  Observações:
  - Coloquei logs para ver o body (útil nos logs do Render).
  - Respostas têm formato consistente.
*/

export const signup = async (req, res) => {
  try {
    console.log("POST /api/users/signup body:", req.body);

    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "E-mail já cadastrado!" });
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

    // Gera imagem base64 do QR
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return res.status(201).json({ message: "Usuário criado!", qrCodeUrl });
  } catch (error) {
    console.error("❌ Erro no signup controller:", error);
    return res.status(500).json({ message: "Erro ao cadastrar", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("POST /api/users/login body:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios!" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Usuário não encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Senha incorreta" });

    // Caso queira sinalizar que precisa do token, pode mandar um flag.
    return res.status(200).json({ message: "Senha correta, digite o código MFA", email });
  } catch (error) {
    console.error("❌ Erro no login controller:", error);
    return res.status(500).json({ message: "Erro ao fazer login", error: error.message });
  }
};

export const verifyMFA = async (req, res) => {
  try {
    console.log("POST /api/users/verify-mfa body:", req.body);

    const { email, token } = req.body;
    if (!email || !token) return res.status(400).json({ message: "Email e token são obrigatórios" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Usuário não encontrado" });

    const verified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: "base32",
      token
    });

    if (verified) {
      return res.json({ message: "Login bem-sucedido!" });
    } else {
      return res.status(400).json({ message: "Código MFA inválido" });
    }
  } catch (error) {
    console.error("❌ Erro no verifyMFA controller:", error);
    return res.status(500).json({ message: "Erro ao verificar código", error: error.message });
  }
};
