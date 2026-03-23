const express = require("express");
const router  = express.Router();
const { obtenerMovimientos, agregarMovimiento, eliminarMovimiento } = require("../controllers/movimientosController");
const { verifyToken } = require("../middleware/auth");

router.get("/",           verifyToken, obtenerMovimientos);
router.post("/agregar",   verifyToken, agregarMovimiento);
router.delete("/:id",     verifyToken, eliminarMovimiento);

module.exports = router;