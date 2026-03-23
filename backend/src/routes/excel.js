const express  = require("express");
const multer   = require("multer");
const router   = express.Router();
const { importarExcel, obtenerProductos, agregarProducto, eliminarProducto } = require("../controllers/excelController");
const { verifyToken } = require("../middleware/auth");

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post("/importar", verifyToken, (req, res, next) => {
  upload.single("excel")(req, res, (err) => {
    if (err) return res.status(400).json({ message: "Error al subir archivo: " + err.message });
    next();
  });
}, importarExcel);

router.get("/productos",        verifyToken, obtenerProductos);
router.post("/agregar",         verifyToken, agregarProducto);
router.delete("/eliminar/:id",  verifyToken, eliminarProducto);

module.exports = router;