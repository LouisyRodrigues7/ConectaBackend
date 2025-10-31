import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "../models/User.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "E-mail já cadastrado!" });

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

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(201).json({ message: "Usuário criado!", qrCodeUrl });
  } catch (error) {
    res.status(500).json({ message: "Erro ao cadastrar", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Usuário não encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Senha incorreta" });

    res.status(200).json({ message: "Senha correta, digite o código MFA", email });
  } catch (error) {
    res.status(500).json({ message: "Erro ao fazer login", error: error.message });
  }
};

export const verifyMFA = async (req, res) => {
  try {
    const { email, token } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Usuário não encontrado" });

    const verified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: "base32",
      token
    });

    if (verified) {
      res.json({ message: "Login bem-sucedido!" });
    } else {
      res.status(400).json({ message: "Código MFA inválido" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erro ao verificar código", error: error.message });
  }
};
