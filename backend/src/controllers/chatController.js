const Groq = require("groq-sdk");
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function chatbot(req, res) {
  try {
    const { mensaje, inventario, movimientos, proveedores } = req.body;
    if (!mensaje) return res.status(400).json({ message: "Mensaje requerido" });

    const inv  = inventario  || [];
    const mov  = movimientos || [];
    const prov = proveedores || [];

    // ── ESTADISTICAS GLOBALES ────────────────────────────
    const totalProductos  = inv.length;
    const stockTotal      = inv.reduce((a, b) => a + (Number(b.stock) || 0), 0);
    const valorTotal      = inv.reduce((a, b) => a + ((Number(b.precio)||0) * (Number(b.stock)||0)), 0);
    const categorias      = [...new Set(inv.map(p => p.categoria))];
    const totalCategorias = categorias.length;
    const sinStock        = inv.filter(p => (Number(p.stock)||0) === 0).length;
    const conStockCount   = totalProductos - sinStock;

    // ── RESUMEN POR CATEGORIA (compacto) ─────────────────
    const resumenCats = categorias.map(cat => {
      const prods    = inv.filter(p => p.categoria === cat);
      const stockCat = prods.reduce((a, b) => a + (Number(b.stock)||0), 0);
      const valorCat = prods.reduce((a, b) => a + ((Number(b.precio)||0)*(Number(b.stock)||0)), 0);
      const precios  = prods.map(p => Number(p.precio)||0).filter(p => p > 0);
      const pMin     = precios.length ? Math.min(...precios) : 0;
      const pMax     = precios.length ? Math.max(...precios) : 0;
      return cat + ":" + prods.length + "prod|stock:" + stockCat + "|valor:S/" + valorCat.toLocaleString() + "|precio:S/" + pMin + "-S/" + pMax;
    }).join("\n");

    // ── LISTA COMPLETA DEL INVENTARIO (Categoria|Marca|Modelo|Precio|Stock|Valor) ──
    const listaInventario = inv
      .slice(0, 80)
      .map(p => {
        const valor = (Number(p.precio)||0) * (Number(p.stock)||0);
        return (p.categoria||"") + "|" + (p.marca||"") + "|" + (p.modelo||"") + "|S/" + (p.precio||0) + "|stock:" + (p.stock||0) + "|val:S/" + valor.toLocaleString();
      }).join("\n");

    // ── PRODUCTOS CON STOCK DISPONIBLE ───────────────────
    const conStock = inv
      .filter(p => (Number(p.stock)||0) > 0)
      .slice(0, 30)
      .map(p => (p.marca||"") + " " + (p.modelo||"") + " S/" + (p.precio||0) + " x" + (p.stock||0) + "ud")
      .join(" | ");

    // ── CONTEXTO OPTIMIZADO ──────────────────────────────
    const contexto =
      "Eres Eagle Bot de Eagle Gaming Peru. Responde en espanol, maximo 3 lineas, usa datos exactos.\n\n" +
      "ESTADISTICAS:\n" +
      "Productos:" + totalProductos + " | Stock:" + stockTotal + "ud | Valor:S/" + valorTotal.toLocaleString() + " | Cats:" + totalCategorias + " | ConStock:" + conStockCount + " | SinStock:" + sinStock + "\n\n" +
      "RESUMEN POR CATEGORIA:\n" + resumenCats + "\n\n" +
      "INVENTARIO COMPLETO (Cat|Marca|Modelo|Precio|Stock|ValorTotal):\n" + listaInventario + "\n\n" +
      (conStock ? "CON STOCK DISPONIBLE:\n" + conStock + "\n\n" : "") +
      "REGLAS:\n" +
      "1. Para precios: busca en INVENTARIO COMPLETO y da el precio exacto del modelo\n" +
      "2. Para contar: usa RESUMEN POR CATEGORIA con numeros exactos\n" +
      "3. Stats globales: " + totalProductos + " productos, stock " + stockTotal + ", valor S/" + valorTotal.toLocaleString() + ", " + totalCategorias + " cats\n" +
      "4. Para registrar: REGISTRAR|categoria|marca|modelo|precio|stock\n" +
      "5. NUNCA inventes datos — usa solo los de arriba";
      "6. Cuando expliques el formato REGISTRAR, usa saltos de linea:\n" +
      "   Escribe:\n" +
      "   REGISTRAR|categoria|marca|modelo|precio|stock\n" +
      "   Ejemplo:\n" +
      "   REGISTRAR|Procesadores|AMD|Ryzen 5 5600|490|5\n" +
      "7. Respuestas cortas — maximo 3 lineas de texto"

    const response = await client.chat.completions.create({
      model:      "llama-3.1-8b-instant",
      max_tokens: 250,
      messages: [
        { role: "system", content: contexto },
        { role: "user",   content: mensaje },
      ],
    });

    const respuesta = response?.choices?.[0]?.message?.content;
    if (!respuesta) return res.json({ respuesta: "No pude generar una respuesta. Intenta de nuevo." });

    return res.json({ respuesta });

  } catch (err) {
    console.error("[chatbot]", err.message);
    if (err.status === 413 || err.message?.includes("rate_limit")) {
      return res.json({ respuesta: "Sistema ocupado. Espera unos segundos e intenta de nuevo." });
    }
    if (err.status === 401) {
      return res.json({ respuesta: "Error de autenticacion con la IA. Verifica la API Key en .env" });
    }
    return res.status(500).json({ message: "Error al procesar mensaje" });
  }
}

module.exports = { chatbot };