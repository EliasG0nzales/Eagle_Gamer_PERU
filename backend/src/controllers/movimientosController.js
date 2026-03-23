const db = require("../db");

async function obtenerMovimientos(req, res) {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM movimientos ORDER BY created_at DESC"
    );
    return res.json({ movimientos: rows });
  } catch (err) {
    console.error("[movimientos/obtener]", err);
    return res.status(500).json({ message: "Error al obtener movimientos" });
  }
}

async function agregarMovimiento(req, res) {
  try {
    const { fecha, producto, tipo, cantidad, costo, responsable } = req.body;
    if (!producto || !cantidad) {
      return res.status(400).json({ message: "Producto y cantidad son requeridos" });
    }
    const [result] = await db.execute(
      `INSERT INTO movimientos (fecha, producto, tipo, cantidad, costo, responsable, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fecha, producto, tipo||"Entrada", Number(cantidad), Number(costo)||0, responsable, req.user?.id||null]
    );
    return res.status(201).json({ message: "Movimiento registrado", id: result.insertId });
  } catch (err) {
    console.error("[movimientos/agregar]", err);
    return res.status(500).json({ message: "Error al registrar movimiento" });
  }
}

async function eliminarMovimiento(req, res) {
  try {
    await db.execute("DELETE FROM movimientos WHERE id = ?", [req.params.id]);
    return res.json({ message: "Movimiento eliminado" });
  } catch (err) {
    console.error("[movimientos/eliminar]", err);
    return res.status(500).json({ message: "Error al eliminar movimiento" });
  }
}

module.exports = { obtenerMovimientos, agregarMovimiento, eliminarMovimiento };