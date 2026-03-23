const db = require("../db");

async function obtenerProveedores(req, res) {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM proveedores ORDER BY created_at DESC"
    );
    return res.json({ proveedores: rows });
  } catch (err) {
    console.error("[proveedores/obtener]", err);
    return res.status(500).json({ message: "Error al obtener proveedores" });
  }
}

async function agregarProveedor(req, res) {
  try {
    const { nombre, producto, precio, entrega, contacto } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: "Nombre es requerido" });
    }
    const [result] = await db.execute(
      `INSERT INTO proveedores (nombre, producto, precio, entrega, contacto)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, producto||"", precio||"", entrega||"", contacto||""]
    );
    return res.status(201).json({ message: "Proveedor agregado", id: result.insertId });
  } catch (err) {
    console.error("[proveedores/agregar]", err);
    return res.status(500).json({ message: "Error al agregar proveedor" });
  }
}

async function eliminarProveedor(req, res) {
  try {
    await db.execute("DELETE FROM proveedores WHERE id = ?", [req.params.id]);
    return res.json({ message: "Proveedor eliminado" });
  } catch (err) {
    console.error("[proveedores/eliminar]", err);
    return res.status(500).json({ message: "Error al eliminar proveedor" });
  }
}

module.exports = { obtenerProveedores, agregarProveedor, eliminarProveedor };