// src/utils/sendEmail.js
import transporter from "../config/email.js";

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ E-mail enviado:", info.response);
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
    throw new Error("Falha ao enviar o e-mail");
  }
};
