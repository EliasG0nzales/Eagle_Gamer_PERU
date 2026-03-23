const express = require("express");
const router  = express.Router();
const { obtenerProveedores, agregarProveedor, eliminarProveedor } = require("../controllers/proveedoresController");
const { verifyToken } = require("../middleware/auth");

router.get("/",           verifyToken, obtenerProveedores);
router.post("/agregar",   verifyToken, agregarProveedor);
router.delete("/:id",     verifyToken, eliminarProveedor);

module.exports = router;