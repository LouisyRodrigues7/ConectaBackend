// src/config/email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true se usar 465, false para 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erro ao conectar ao servidor de e-mail:", error);
  } else {
    console.log("📨 Servidor de e-mail conectado com sucesso! Pronto para enviar mensagens.");
  }
});

export default transporter;
