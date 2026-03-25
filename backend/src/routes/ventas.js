const express  = require("express");
const router   = express.Router();
const { registrarVenta, obtenerVentas, eliminarVenta } = require("../controllers/ventasController");
const { verifyToken } = require("../middleware/auth");

router.get("/",           verifyToken, obtenerVentas);
router.post("/registrar", verifyToken, registrarVenta);
router.delete("/:id",     verifyToken, eliminarVenta);

module.exports = router;