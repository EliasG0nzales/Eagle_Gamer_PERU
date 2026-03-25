const db = require("../db");

// ── REGISTRAR VENTA ──────────────────────────────────────────
async function registrarVenta(req, res) {
  try {
    const { producto_id, categoria, marca, modelo, cantidad, precio, cliente, canal } = req.body;
    if (!modelo || !cantidad || !precio) {
      return res.status(400).json({ message: "Modelo, cantidad y precio son requeridos" });
    }
    const total = Number(precio) * Number(cantidad);

    await db.execute(
      `INSERT INTO ventas (producto_id, categoria, marca, modelo, cantidad, precio, total, cliente, canal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [producto_id||null, categoria||"", marca||"", modelo, Number(cantidad), Number(precio), total, cliente||"Cliente", canal||"dashboard"]
    );

    // Descontar stock del inventario
    if (producto_id) {
      await db.execute(
        `UPDATE excel_records SET data = JSON_SET(data, '$.cantidad', 
         GREATEST(0, CAST(JSON_EXTRACT(data, '$.cantidad') AS UNSIGNED) - ?))
         WHERE id = ?`,
        [Number(cantidad), producto_id]
      );
    }

    return res.status(201).json({ message: "Venta registrada", total });
  } catch (err) {
    console.error("[ventas/registrar]", err);
    return res.status(500).json({ message: "Error al registrar venta" });
  }
}

// ── OBTENER VENTAS CON FILTRO DE FECHAS ──────────────────────
async function obtenerVentas(req, res) {
  try {
    const { desde, hasta } = req.query;
    let query  = "SELECT * FROM ventas";
    let params = [];

    if (desde && hasta) {
      query  += " WHERE fecha BETWEEN ? AND ?";
      params  = [desde + " 00:00:00", hasta + " 23:59:59"];
    } else if (desde) {
      query  += " WHERE fecha >= ?";
      params  = [desde + " 00:00:00"];
    } else if (hasta) {
      query  += " WHERE fecha <= ?";
      params  = [hasta + " 23:59:59"];
    }

    query += " ORDER BY fecha DESC";

    const [rows] = await db.execute(query, params);

    const totalVentas   = rows.length;
    const totalIngresos = rows.reduce((a, b) => a + Number(b.total), 0);
    const totalUnidades = rows.reduce((a, b) => a + Number(b.cantidad), 0);

    return res.json({ ventas: rows, totalVentas, totalIngresos, totalUnidades });
  } catch (err) {
    console.error("[ventas/obtener]", err);
    return res.status(500).json({ message: "Error al obtener ventas" });
  }
}

// ── RESUMEN DE VENTAS POR FECHA (para WhatsApp) ──────────────
async function resumenVentas(desde, hasta) {
  try {
    let query  = "SELECT * FROM ventas";
    let params = [];

    if (desde && hasta) {
      query  += " WHERE fecha BETWEEN ? AND ?";
      params  = [desde + " 00:00:00", hasta + " 23:59:59"];
    }

    query += " ORDER BY fecha DESC";
    const [rows] = await db.execute(query, params);

    const totalIngresos = rows.reduce((a, b) => a + Number(b.total), 0);
    const totalUnidades = rows.reduce((a, b) => a + Number(b.cantidad), 0);

    const porProducto = {};
    rows.forEach(v => {
      const key = `${v.marca} ${v.modelo}`;
      if (!porProducto[key]) porProducto[key] = { cantidad: 0, total: 0 };
      porProducto[key].cantidad += Number(v.cantidad);
      porProducto[key].total    += Number(v.total);
    });

    const topProductos = Object.entries(porProducto)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([nombre, data]) => `• ${nombre}: ${data.cantidad} ud — S/${data.total.toLocaleString()}`)
      .join("\n");

    return {
      totalVentas:   rows.length,
      totalIngresos,
      totalUnidades,
      topProductos,
      ventas:        rows,
    };
  } catch (err) {
    console.error("[ventas/resumen]", err);
    return null;
  }
}

// ── ELIMINAR VENTA ───────────────────────────────────────────
async function eliminarVenta(req, res) {
  try {
    await db.execute("DELETE FROM ventas WHERE id = ?", [req.params.id]);
    return res.json({ message: "Venta eliminada" });
  } catch (err) {
    console.error("[ventas/eliminar]", err);
    return res.status(500).json({ message: "Error al eliminar venta" });
  }
}

module.exports = { registrarVenta, obtenerVentas, resumenVentas, eliminarVenta };