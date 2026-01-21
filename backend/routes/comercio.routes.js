import express from "express";
import pool from "../db/db.js";
import { activarComercio } from "../controllers/comercioController.js";
const router = express.Router();

router.get("/:id_usuario", async (req, res) => {
  const id_usuario = Number(req.params.id_usuario);

  if (!id_usuario) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM comercio WHERE id_usuario = $1",
      [id_usuario]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error("Error GET comercio:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


// Activar o actualizar comercio
router.post("/activar", activarComercio); 

export default router;
