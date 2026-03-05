import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporte de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Tu correo de Gmail
    pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación (ecpy twke ogbu ouvm)
  }
});

/**
 * Función universal para enviar correos
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} html - Contenido en formato HTML
 */
export const sendEmail = async (to, subject, html) => {
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
};