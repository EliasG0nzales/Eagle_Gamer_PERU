const xlsx = require("xlsx");
const db   = require("../db");

async function importarExcel(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No se subio ningun archivo" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });

    const hojas = [
      "Tarjeta de Vídeo","Case","Placa Madre","Laptops","Estabilizador",
      "Disco SSD","Fuente de poder","RAM","Procesadores","Monitores","Perifericos"
    ];

    // ── LIMPIAR REGISTROS DEL EXCEL ANTERIOR ─────────────
    // Borra solo los importados del Excel, mantiene los manuales
    await db.execute("DELETE FROM excel_records WHERE filename != 'manual'");
    // ─────────────────────────────────────────────────────

    let totalInsertados = 0;

    for (const hoja of hojas) {
      if (!workbook.SheetNames.includes(hoja)) continue;

      const ws   = workbook.Sheets[hoja];
      const rows = xlsx.utils.sheet_to_json(ws, { header:1, defval:null });

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const categoria = row[0];
        const modelo    = row[1];
        const precio    = row[2];

        if (!categoria || !modelo) continue;
        if (typeof precio !== "number") continue;
        if (precio <= 0) continue;
        if (String(categoria).toLowerCase().includes("categor")) continue;

        const data = JSON.stringify({
          categoria:     String(categoria).trim(),
          modelo:        String(modelo).trim(),
          precio_venta:  precio,
          precio_min:    row[3] || null,
          precio_compra: row[4] || null,
          cantidad:      row[5] || 0,
        });

        await db.execute(
          `INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by)
           VALUES (?, ?, ?, ?, ?)`,
          [req.file.originalname, hoja, i, data, req.user?.id || null]
        );

        totalInsertados++;
      }
    }

    return res.json({ message: "Excel importado correctamente", total: totalInsertados });

  } catch (err) {
    console.error("[excel/importar]", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function obtenerProductos(req, res) {
  try {
    const [rows] = await db.execute(
      "SELECT id, sheet_name, data, created_at FROM excel_records ORDER BY sheet_name, id"
    );

    const productos = rows.map(r => {
      let parsed = {};
      try {
        parsed = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
      } catch {
        parsed = {};
      }
      return {
        id:         r.id,
        categoria:  r.sheet_name,
        created_at: r.created_at,
        ...parsed,
      };
    });

    return res.json({ total: productos.length, productos });
  } catch (err) {
    console.error("[excel/obtener]", err);
    return res.status(500).json({ message: "Error al obtener productos" });
  }
}

async function agregarProducto(req, res) {
  try {
    const { categoria, marca, modelo, precio, stock } = req.body;
    if (!categoria || !modelo) {
      return res.status(400).json({ message: "Categoria y modelo son requeridos" });
    }

    const data = JSON.stringify({
      categoria:    String(categoria).trim(),
      modelo:       String(modelo).trim(),
      precio_venta: Number(precio) || 0,
      cantidad:     Number(stock)  || 0,
      marca:        String(marca || "").trim(),
    });

    const [result] = await db.execute(
      `INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by)
       VALUES (?, ?, ?, ?, ?)`,
      ["manual", categoria, 0, data, req.user?.id || null]
    );

    return res.status(201).json({ message: "Producto guardado", id: result.insertId });
  } catch (err) {
    console.error("[excel/agregar]", err);
    return res.status(500).json({ message: "Error al guardar producto" });
  }
}

async function eliminarProducto(req, res) {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM excel_records WHERE id = ?", [id]);
    return res.json({ message: "Producto eliminado" });
  } catch (err) {
    console.error("[excel/eliminar]", err);
    return res.status(500).json({ message: "Error al eliminar producto" });
  }
}

module.exports = { importarExcel, obtenerProductos, agregarProducto, eliminarProducto };