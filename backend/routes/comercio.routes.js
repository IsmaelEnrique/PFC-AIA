import { Router } from "express";
import { activarComercio } from "../controllers/comercioController.js";

const router = Router();

router.post("/activar", activarComercio);

export default router;
