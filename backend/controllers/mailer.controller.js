/*import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,              // 🚀 CAMBIO: Usamos 587 en lugar de 465
  secure: false,          // false para puerto 587 (usa STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Ayuda a evitar bloqueos en servidores de nube
  }
});
/**
 * Función universal para enviar correos
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} html - Contenido en formato HTML
 */
/*export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Emprendify 🚀" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado con éxito: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    return { success: false, error: error.message };
  }
};*/
import dotenv from "dotenv";
dotenv.config();

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      html: html
    });

    console.log("✅ Email enviado:", data);
    return { success: true };

  } catch (error) {
    console.error("❌ Error enviando mail:", error);
    throw error;
  }
};