// backend/src/controllers/mercadoPagoController.js
import pool from "../db/db.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const vincularVendedor = async (req, res) => {
  const { code, state } = req.query; // 'code' es el permiso, 'state' es el ID del usuario

  try {
    const response = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_secret: process.env.MP_CLIENT_SECRET,
        client_id: process.env.MP_CLIENT_ID,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.MP_REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      // GUARDAMOS EL TOKEN DEL VENDEDOR EN SU FILA DE COMERCIO
      await pool.query(
        "UPDATE comercio SET mp_access_token = $1, mp_user_id = $2 WHERE id_usuario = $3",
        [data.access_token, data.user_id, state]
      );
      res.redirect(`${FRONTEND_URL}/admin/configuracion?vinc=success`);
    }
  } catch (error) {
    res.redirect(`${FRONTEND_URL}/admin/configuracion?vinc=error`);
  }
};