// backend/src/bot/whatsapp.js
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode  = require("qrcode");
const db      = require("../db");
const { chatbot } = require("../controllers/chatController");
const fs      = require("fs");
const path    = require("path");
const Groq    = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const VOZ_HABILITADA   = true;
const VOZ_SOLO_AUDIO   = false;
const WHISPER_LANGUAGE = "es";

const TEMP_DIR = path.join(__dirname, "../../temp_audio");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

let qrCodeBase64 = null;
let botEstado    = "desconectado";

// ─────────────────────────────────────────────────────────────
// SPEECH TO TEXT — Groq Whisper
// ─────────────────────────────────────────────────────────────
async function transcribirAudio(message) {
  const timestamp = Date.now();
  const oggPath   = path.join(TEMP_DIR, `voice_${timestamp}.ogg`);
  try {
    console.log("📥 Descargando nota de voz...");
    const media = await message.downloadMedia();
    if (!media?.data) throw new Error("No se pudo descargar el audio");
    fs.writeFileSync(oggPath, Buffer.from(media.data, "base64"));
    console.log("🎤 Transcribiendo con Groq Whisper...");
    const transcription = await groq.audio.transcriptions.create({
      file:     fs.createReadStream(oggPath),
      model:    "whisper-large-v3",
      language: WHISPER_LANGUAGE,
    });
    console.log("📝 Transcripcion:", transcription.text);
    return transcription.text.trim();
  } catch (err) {
    console.error("❌ Error transcribiendo:", err.message);
    throw err;
  } finally {
    if (fs.existsSync(oggPath)) fs.unlinkSync(oggPath);
  }
}

// ─────────────────────────────────────────────────────────────
// CARGAR INVENTARIO REAL DESDE MYSQL
// ─────────────────────────────────────────────────────────────
async function cargarInventario() {
  try {
    const [rows] = await db.query(
      "SELECT id, sheet_name, data FROM excel_records ORDER BY sheet_name, id"
    );
    return rows.map((r) => {
      let parsed = {};
      try { parsed = typeof r.data === "string" ? JSON.parse(r.data) : r.data; } catch {}
      const catRaw    = String(parsed.categoria || "");
      const marcaReal = catRaw
        .replace(/^(monitor|procesador|tarjeta de video|tarjeta grafica|placa madre|case|ram|memoria|ssd|disco|fuente|laptop|estabilizador|periferico|audifono|audifonos|mouse|teclado|combo|kit|webcam|camara)\s*/i, "")
        .trim().split(" ")[0] || "—";
      return {
        id:        r.id,
        categoria: r.sheet_name || "—",
        marca:     marcaReal,
        modelo:    parsed.modelo || "—",
        precio:    Number(parsed.precio_venta) || 0,
        stock:     Number(parsed.cantidad)     || 0,
      };
    });
  } catch (err) {
    console.error("Error cargando inventario:", err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// BUSCAR PRODUCTO CON MEJOR COINCIDENCIA
// ─────────────────────────────────────────────────────────────
function buscarProducto(txt, inventario) {
  const txtLimpio = txt
    .replace(/quiero|comprar|compra|dame|llevar|me das|me interesa|precio final|lo quiero|buscar|busca|eliminar|quitar|restar|vender|venta|un|una|el|la|de/g, "")
    .trim();

  const palabras = txtLimpio.split(" ").filter(p => p.length > 1);
  if (!palabras.length) return [];

  const encontrados = inventario.filter(p => {
    const modeloCompleto = `${p.marca} ${p.modelo}`.toLowerCase();
    const categoria      = (p.categoria || "").toLowerCase();
    return palabras.some(pal =>
      modeloCompleto.includes(pal.toLowerCase()) ||
      categoria.includes(pal.toLowerCase())      ||
      p.modelo.toLowerCase().includes(pal.toLowerCase())
    );
  });

  // Ordenar por mejor coincidencia
  return encontrados.sort((a, b) => {
    const modeloA = `${a.marca} ${a.modelo}`.toLowerCase();
    const modeloB = `${b.marca} ${b.modelo}`.toLowerCase();
    const matchA  = palabras.filter(p => modeloA.includes(p.toLowerCase())).length;
    const matchB  = palabras.filter(p => modeloB.includes(p.toLowerCase())).length;
    return matchB - matchA;
  });
}

// ─────────────────────────────────────────────────────────────
// REGISTRAR PRODUCTO EN MYSQL
// ─────────────────────────────────────────────────────────────
async function registrarProductoEnBD(categoria, marca, modelo, precio, stock, origen) {
  const [rows] = await db.query("SELECT MAX(row_index) as maxIdx FROM excel_records");
  const nextIdx = (rows[0].maxIdx ?? -1) + 1;

  const data = JSON.stringify({
    categoria:    `${marca.trim()} ${modelo.trim()}`,
    modelo:       modelo.trim(),
    precio_venta: Number(precio) || 0,
    cantidad:     Number(stock)  || 0,
  });

  await db.query(
    `INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES (?, ?, ?, ?, ?)`,
    [origen || "whatsapp", categoria.trim(), nextIdx, data, null]
  );

  return { categoria: categoria.trim(), marca: marca.trim(), modelo: modelo.trim(), precio: Number(precio)||0, stock: Number(stock)||0 };
}

// ─────────────────────────────────────────────────────────────
// REGISTRAR VENTA EN MYSQL
// ─────────────────────────────────────────────────────────────
async function registrarVentaEnBD(producto, cantidad, cliente) {
  try {
    const total = (Number(producto.precio)||0) * Number(cantidad);

    // 1. Guardar en tabla ventas
    await db.query(
      `INSERT INTO ventas (producto_id, categoria, marca, modelo, cantidad, precio, total, cliente, canal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [producto.id||null, producto.categoria||"", producto.marca||"", producto.modelo, Number(cantidad), Number(producto.precio)||0, total, cliente||"Cliente WhatsApp", "whatsapp"]
    );

    // 2. Descontar stock del inventario
    await db.query(
      `UPDATE excel_records 
       SET data = JSON_SET(data, '$.cantidad', GREATEST(0, CAST(JSON_EXTRACT(data, '$.cantidad') AS UNSIGNED) - ?))
       WHERE id = ?`,
      [Number(cantidad), producto.id]
    );

    // 3. Registrar movimiento de salida
    await db.query(
      `INSERT INTO movimientos (fecha, producto, tipo, cantidad, costo, responsable)
       VALUES (NOW(), ?, 'Salida', ?, ?, ?)`,
      [`${producto.marca} ${producto.modelo}`, Number(cantidad), Number(producto.precio)||0, "Bot WhatsApp"]
    );

    return true;
  } catch (err) {
    console.error("Error registrando venta:", err.message);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// QUITAR/RESTAR STOCK SIN REGISTRAR VENTA
// ─────────────────────────────────────────────────────────────
async function restarStockEnBD(producto, cantidad) {
  try {
    await db.query(
      `UPDATE excel_records 
       SET data = JSON_SET(data, '$.cantidad', GREATEST(0, CAST(JSON_EXTRACT(data, '$.cantidad') AS UNSIGNED) - ?))
       WHERE id = ?`,
      [Number(cantidad), producto.id]
    );
    return true;
  } catch (err) {
    console.error("Error restando stock:", err.message);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// RESUMEN DE VENTAS DESDE MYSQL
// ─────────────────────────────────────────────────────────────
async function obtenerResumenVentas(periodo) {
  try {
    let query  = "SELECT * FROM ventas";
    let params = [];
    const hoy  = new Date().toISOString().split("T")[0];

    if (periodo === "hoy") {
      query  += " WHERE DATE(fecha) = ?";
      params  = [hoy];
    } else if (periodo === "ayer") {
      const ayer = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      query  += " WHERE DATE(fecha) = ?";
      params  = [ayer];
    } else if (periodo === "semana") {
      query  += " WHERE fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (periodo === "mes") {
      query  += " WHERE fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    }

    query += " ORDER BY fecha DESC";
    const [rows] = await db.query(query, params);

    if (!rows.length) return null;

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

    return { totalVentas: rows.length, totalIngresos, totalUnidades, topProductos };
  } catch (err) {
    console.error("Error obteniendo ventas:", err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// DETECTAR INTENCION DE REGISTRO
// ─────────────────────────────────────────────────────────────
function esIntencionDeRegistro(txt) {
  return ["registrar","registrame","regístrame","registra","agregar","agrega","agregame","agrégame","añadir","añade","ingresa","ingresar","guardar","guarda","nuevo producto","nuevo modelo"].some(p => txt.includes(p));
}

function esIntencionCompra(txt) {
  return ["comprar","quiero comprar","dame","llevar","me das","me interesa","precio final","lo quiero","vender","venta de","vendí","vendi","se vendio","se vendió"].some(p => txt.includes(p));
}

function esIntencionEliminar(txt) {
  return ["eliminar","quitar","restar","borrar","sacar","descontar"].some(p => txt.includes(p));
}

function esIntencionVentas(txt) {
  return ["cuanto vendimos","cuánto vendimos","ventas de","registro de ventas","cuantas ventas","cuántas ventas","reporte de ventas","vendimos hoy","vendimos ayer","vendimos esta semana","vendimos este mes"].some(p => txt.includes(p));
}

function detectarPeriodo(txt) {
  if (txt.includes("hoy"))    return "hoy";
  if (txt.includes("ayer"))   return "ayer";
  if (txt.includes("semana")) return "semana";
  if (txt.includes("mes"))    return "mes";
  return "hoy";
}

function detectarCantidad(txt) {
  const match = txt.match(/(\d+)\s*(unidad|unidades|ud|pcs?)?/i);
  return match ? parseInt(match[1]) : 1;
}

// ─────────────────────────────────────────────────────────────
// EXTRAER DATOS DE REGISTRO CON IA
// ─────────────────────────────────────────────────────────────
async function extraerDatosRegistro(textoVoz) {
  try {
    const prompt = `Eres un asistente de Eagle Gaming Peru. El usuario quiere registrar un producto en el inventario.

Extrae los datos del siguiente mensaje y responde SOLO con este formato exacto (sin explicaciones):
REGISTRAR|categoria|marca|modelo|precio|stock

IMPORTANTE:
- "marca" es el fabricante real (AMD, Intel, ASUS, Xiaomi, MSI, Gigabyte, Kingston, Logitech, Corsair, etc.)
- NO uses palabras como "Monitor", "Procesador", "GPU" como marca
- "precio" y "stock" son solo numeros
- Si no se menciona precio o stock, usa 0

Categorias validas: Tarjeta de Video, Procesadores, Monitores, RAM, Disco SSD, Placa Madre, Case, Fuente de poder, Laptops, Estabilizador, Perifericos

Mensaje: "${textoVoz}"

Si no puedes extraer datos, responde: DATOS_INCOMPLETOS`;

    const response = await groq.chat.completions.create({
      model:      "llama-3.1-8b-instant",
      max_tokens: 100,
      messages:   [{ role: "user", content: prompt }],
    });

    const resultado = response?.choices?.[0]?.message?.content?.trim() || "";
    console.log("🤖 IA extrae:", resultado);
    return resultado;
  } catch (err) {
    console.error("Error extrayendo datos:", err.message);
    return "DATOS_INCOMPLETOS";
  }
}

// ─────────────────────────────────────────────────────────────
// MAPA DE CATEGORIAS
// ─────────────────────────────────────────────────────────────
const MAPA_CATEGORIAS = {
  "monitor":       ["Monitores","Monitor"],
  "monitores":     ["Monitores","Monitor"],
  "gpu":           ["Tarjeta de Vídeo","Tarjeta de Video"],
  "tarjeta":       ["Tarjeta de Vídeo","Tarjeta de Video"],
  "grafica":       ["Tarjeta de Vídeo","Tarjeta de Video"],
  "procesador":    ["Procesadores","Procesador"],
  "procesadores":  ["Procesadores","Procesador"],
  "cpu":           ["Procesadores","Procesador"],
  "ram":           ["RAM"],
  "memoria":       ["RAM"],
  "ssd":           ["Disco SSD"],
  "disco":         ["Disco SSD"],
  "placa":         ["Placa Madre"],
  "motherboard":   ["Placa Madre"],
  "case":          ["Case"],
  "gabinete":      ["Case"],
  "fuente":        ["Fuente de poder"],
  "laptop":        ["Laptops","Laptop"],
  "laptops":       ["Laptops","Laptop"],
  "estabilizador": ["Estabilizador"],
  "periferico":    ["Perifericos","Periferico"],
  "perifericos":   ["Perifericos","Periferico"],
  "mouse":         ["Perifericos"],
  "teclado":       ["Perifericos"],
  "audifono":      ["Perifericos"],
};

function buscarCategoria(texto, inventario) {
  const txt = texto.toLowerCase();
  for (const [clave, categorias] of Object.entries(MAPA_CATEGORIAS)) {
    if (txt.includes(clave)) {
      const prods = inventario.filter(p =>
        categorias.some(cat => p.categoria.toLowerCase().includes(cat.toLowerCase()))
      );
      if (prods.length > 0) return { clave, prods };
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// PROCESAR MENSAJE PRINCIPAL
// ─────────────────────────────────────────────────────────────
async function procesarMensaje(texto, esVoz = false) {
  const txt        = texto.trim().toLowerCase();
  const inventario = await cargarInventario();

  // ── 1. FORMATO DIRECTO: REGISTRAR|...|...|...|...|... ────────
  if (texto.toUpperCase().startsWith("REGISTRAR|")) {
    const partes = texto.split("|");
    if (partes.length >= 6) {
      const [, categoria, marca, modelo, precio, stock] = partes;
      try {
        await registrarProductoEnBD(categoria, marca, modelo, precio, stock, esVoz ? "whatsapp-voz" : "whatsapp");
        return `✅ Producto registrado:\n• Categoría: ${categoria.trim()}\n• Marca: ${marca.trim()}\n• Modelo: ${modelo.trim()}\n• Precio: S/${precio.trim()}\n• Stock: ${stock.trim()} unidades\n\n📊 Ya aparece en el Dashboard.`;
      } catch (err) {
        return `❌ Error al registrar. Formato:\nREGISTRAR|categoria|marca|modelo|precio|stock`;
      }
    }
    return `❌ Formato incorrecto. Ejemplo:\nREGISTRAR|Procesadores|AMD|Ryzen 5 5600|490|10`;
  }

  // ── 2. REPORTE DE VENTAS ──────────────────────────────────────
  if (esIntencionVentas(txt)) {
    const periodo  = detectarPeriodo(txt);
    const resumen  = await obtenerResumenVentas(periodo);
    if (!resumen) return `📊 No hay ventas registradas ${periodo === "hoy" ? "hoy" : periodo === "ayer" ? "ayer" : `esta ${periodo}`}.`;
    return `📊 *Ventas ${periodo === "hoy" ? "de hoy" : periodo === "ayer" ? "de ayer" : periodo === "semana" ? "de esta semana" : "de este mes"}*\n\n💰 Total ingresos: S/${resumen.totalIngresos.toLocaleString()}\n📦 Unidades vendidas: ${resumen.totalUnidades}\n🧾 Número de ventas: ${resumen.totalVentas}\n\n🏆 Top productos:\n${resumen.topProductos}`;
  }

  // ── 3. REGISTRO POR VOZ O TEXTO NATURAL ──────────────────────
  if (esIntencionDeRegistro(txt)) {
    const iaResultado = await extraerDatosRegistro(texto);
    if (iaResultado.toUpperCase().startsWith("REGISTRAR|")) {
      const partes = iaResultado.split("|");
      if (partes.length >= 6) {
        const [, categoria, marca, modelo, precio, stock] = partes;
        try {
          await registrarProductoEnBD(categoria, marca, modelo, precio, stock, esVoz ? "whatsapp-voz" : "whatsapp");
          return `✅ Producto registrado${esVoz ? " por voz" : ""}:\n• Categoría: ${categoria.trim()}\n• Marca: ${marca.trim()}\n• Modelo: ${modelo.trim()}\n• Precio: S/${precio.trim()}\n• Stock: ${stock.trim()} unidades\n\n📊 Ya aparece en el Dashboard.`;
        } catch (err) {
          return `❌ Error al guardar. Intenta:\n"Registrar procesadores AMD Ryzen 5 5600 precio 490 stock 5"`;
        }
      }
    }
    return `🎙️ No pude extraer todos los datos. ${esVoz ? "Di" : "Escribe"}:\n"Registrar [categoría] [marca] [modelo] precio [monto] stock [cantidad]"\n\nEjemplo:\n"Registrar Procesadores AMD Ryzen 5 5600GT precio 569 stock 10"`;
  }

  // ── 4. ELIMINAR / RESTAR STOCK ───────────────────────────────
  if (esIntencionEliminar(txt)) {
    const encontrados = buscarProducto(txt, inventario);
    if (!encontrados.length) return `❌ No encontré ese producto. Escribe mejor el nombre.`;
    const producto  = encontrados[0];
    const cantidad  = detectarCantidad(txt);
    const ok        = await restarStockEnBD(producto, cantidad);
    if (!ok) return `❌ Error al restar stock.`;
    return `✅ Stock actualizado:\n• ${producto.marca} ${producto.modelo}\n• Se restaron ${cantidad} unidades\n• Stock anterior: ${producto.stock}\n• Stock nuevo: ${Math.max(0, producto.stock - cantidad)}`;
  }

  // ── 5. INTENCIÓN DE COMPRA / VENTA ───────────────────────────
  if (esIntencionCompra(txt)) {
    const encontrados = buscarProducto(txt, inventario);
    if (!encontrados.length) return `❌ No encontré ese producto. Escribe mejor el modelo o usa /buscar [nombre].`;

    const producto = encontrados[0];
    const cantidad = detectarCantidad(txt);

    if (producto.stock <= 0) {
      return `❌ *${producto.marca} ${producto.modelo}* está sin stock.\n\nProductos similares con stock:\n${encontrados.filter(p=>p.stock>0).slice(0,3).map(p=>`• ${p.marca} ${p.modelo} S/${p.precio} (stock:${p.stock})`).join("\n") || "Ninguno disponible."}`;
    }

    if (cantidad > producto.stock) {
      return `⚠️ Solo hay ${producto.stock} unidades de ${producto.marca} ${producto.modelo}.\n¿Deseas comprar ${producto.stock} unidades? Responde confirmando.`;
    }

    const ok = await registrarVentaEnBD(producto, cantidad, "Cliente WhatsApp");
    if (!ok) return `❌ Error registrando la venta. Intenta de nuevo.`;

    const total = (producto.precio || 0) * cantidad;
    return `🛒 *Venta registrada* ✅\n\n📦 Producto: ${producto.marca} ${producto.modelo}\n🔢 Cantidad: ${cantidad} unidad${cantidad>1?"es":""}\n💰 Precio unitario: S/${producto.precio}\n💵 Total: S/${total.toLocaleString()}\n📉 Stock restante: ${Math.max(0, producto.stock - cantidad)}\n\n🚚 Un asesor confirmará tu pedido en breve.`;
  }

  // ── 6. CUANTOS HAY EN UNA CATEGORIA ─────────────────────────
  if (txt.includes("cuantos") || txt.includes("cuántos") || txt.includes("hay") || txt.includes("tienen") || txt.includes("tienes")) {
    const resultado = buscarCategoria(txt, inventario);
    if (resultado) {
      const { clave, prods } = resultado;
      const conStock = prods.filter(p => p.stock > 0);
      const sinStock = prods.filter(p => p.stock === 0);
      const precios  = prods.map(p => p.precio).filter(p => p > 0);
      const pMin     = precios.length ? Math.min(...precios) : 0;
      const pMax     = precios.length ? Math.max(...precios) : 0;
      return `${clave.charAt(0).toUpperCase()+clave.slice(1)} en catálogo: ${prods.length} modelos\n• Con stock: ${conStock.length}\n• Sin stock: ${sinStock.length}\n• Precios: S/${pMin} - S/${pMax}\n\nEscribe /lista ${clave} para ver todos los modelos.`;
    }
  }

  // ── 7. LISTAR MODELOS ────────────────────────────────────────
  if (txt.startsWith("/lista") || txt.startsWith("lista ") || txt.includes("lista de") || txt.includes("modelos de") || txt.includes("que modelos") || txt.includes("qué modelos")) {
    const resultado = buscarCategoria(txt, inventario);
    if (resultado) {
      const { clave, prods } = resultado;
      const lista = prods.map(p =>
        `• ${p.marca} ${p.modelo} — S/${p.precio}${p.stock > 0 ? ` (stock: ${p.stock})` : " ❌sin stock"}`
      ).join("\n");
      return `${clave.charAt(0).toUpperCase()+clave.slice(1)} (${prods.length} modelos):\n${lista}`;
    }
  }

  // ── 8. PRECIO DE UN MODELO ───────────────────────────────────
  if (txt.includes("cuanto cuesta") || txt.includes("cuánto cuesta") || txt.includes("precio de") || txt.includes("precio del") || txt.includes("precio")) {
    const encontrados = buscarProducto(txt, inventario);
    if (encontrados.length > 0) {
      const lista = encontrados.slice(0, 5).map(p =>
        `• ${p.marca} ${p.modelo} — S/${p.precio}${p.stock > 0 ? ` (stock: ${p.stock})` : " ❌sin stock"}`
      ).join("\n");
      return `Productos encontrados:\n${lista}`;
    }
  }

  // ── 9. COMANDOS RAPIDOS ──────────────────────────────────────
  if (txt === "/ayuda" || txt === "ayuda" || txt === "menu") {
    return `🦅 *Eagle Bot — Eagle Gaming Peru*\n\n*Consultas:*\n• "¿Cuántos monitores hay?"\n• "Lista de procesadores"\n• "¿Cuánto cuesta el Ryzen 5 5600GT?"\n• /buscar [término]\n• /lista [categoría]\n• /precios [categoría]\n• /inventario\n\n*Compras/Ventas:*\n• "Quiero comprar un Ryzen 5 5600GT"\n• "Vendí 2 monitores MSI"\n\n*Reportes de ventas:*\n• "¿Cuánto vendimos hoy?"\n• "Ventas de esta semana"\n• "Reporte de ventas del mes"\n\n*Registro de productos:*\n• "Registrar Procesadores AMD Ryzen 7 5800X precio 850 stock 5"\n• REGISTRAR|categoria|marca|modelo|precio|stock\n\n*Quitar stock:*\n• "Eliminar 3 unidades del Ryzen 5 5600GT"\n\n🎙️ También puedes enviar notas de voz!`;
  }

  if (txt === "/inventario") {
    const cats       = [...new Set(inventario.map(p => p.categoria))];
    const stockTotal = inventario.reduce((a, b) => a + (b.stock || 0), 0);
    const valorTotal = inventario.reduce((a, b) => a + ((b.precio || 0) * (b.stock || 0)), 0);
    const resumen    = cats.map(cat => {
      const prods    = inventario.filter(p => p.categoria === cat);
      const conStock = prods.filter(p => p.stock > 0).length;
      const precios  = prods.map(p => p.precio).filter(p => p > 0);
      const pMin     = precios.length ? Math.min(...precios) : 0;
      const pMax     = precios.length ? Math.max(...precios) : 0;
      return `• ${cat}: ${prods.length} modelos (S/${pMin}-S/${pMax}) stock:${conStock}`;
    }).join("\n");
    return `🦅 *Inventario Eagle Gaming Peru*\nTotal: ${inventario.length} productos | Stock: ${stockTotal} ud | Valor: S/${valorTotal.toLocaleString()}\n\n${resumen}`;
  }

  if (txt.startsWith("/buscar")) {
    const termino = txt.replace("/buscar", "").trim();
    if (!termino) return `Uso: /buscar [término]\nEj: /buscar RTX 4060`;
    const encontrados = inventario.filter(p =>
      p.modelo.toLowerCase().includes(termino) ||
      p.marca.toLowerCase().includes(termino)   ||
      p.categoria.toLowerCase().includes(termino)
    );
    if (!encontrados.length) return `No encontré productos con "${termino}".`;
    const lista = encontrados.slice(0, 8).map(p =>
      `• ${p.marca} ${p.modelo} — S/${p.precio}${p.stock > 0 ? ` (stock: ${p.stock})` : " ❌sin stock"}`
    ).join("\n");
    return `Resultados para "${termino}" (${encontrados.length}):\n${lista}`;
  }

  if (txt.startsWith("/precios")) {
    const cat       = txt.replace("/precios", "").trim();
    const resultado = buscarCategoria(cat || txt, inventario);
    if (resultado) {
      const { clave, prods } = resultado;
      const lista = prods.slice(0, 10).map(p => `• ${p.marca} ${p.modelo} S/${p.precio}`).join("\n");
      return `Precios ${clave}:\n${lista}`;
    }
    return `Categorías: monitor, gpu, procesador, ram, ssd, placa, case, fuente, laptop\nEj: /precios monitor`;
  }

  if (txt.startsWith("/ventas")) {
    const periodo = detectarPeriodo(txt) || "hoy";
    const resumen = await obtenerResumenVentas(periodo);
    if (!resumen) return `📊 No hay ventas registradas hoy.`;
    return `📊 *Ventas de hoy*\n💰 Ingresos: S/${resumen.totalIngresos.toLocaleString()}\n📦 Unidades: ${resumen.totalUnidades}\n🧾 Ventas: ${resumen.totalVentas}\n\n🏆 Top productos:\n${resumen.topProductos}`;
  }

  // ── 10. SALUDOS ──────────────────────────────────────────────
  if (["hola","buenos dias","buenas tardes","buenas noches","buenas","hey","buen dia"].some(s => txt.includes(s))) {
    return `Hola! 👋 Soy Eagle Bot de Eagle Gaming Peru.\n\nTenemos ${inventario.length} productos en catálogo.\n\n🎙️ Puedes escribirme o enviarme notas de voz!\n\nEscribe /ayuda para ver todos los comandos.`;
  }

  if (["gracias","ok gracias","perfecto","listo","genial"].some(s => txt.includes(s))) {
    return `Con gusto! Si necesitas algo más, aquí estoy. 😊`;
  }

  // ── 11. PREGUNTA LIBRE → IA ──────────────────────────────────
  let iaRespuesta = "No pude procesar tu consulta. Escribe /ayuda para ver los comandos.";
  try {
    const fakeReq = { body: { mensaje: texto.trim(), inventario, movimientos: [], proveedores: [] } };
    const fakeRes = {
      json:   (data) => { iaRespuesta = data.respuesta || data.message || iaRespuesta; },
      status: ()     => fakeRes,
    };
    await chatbot(fakeReq, fakeRes);
  } catch (err) {
    console.error("Error IA WhatsApp:", err.message);
  }
  return iaRespuesta;
}

// ─────────────────────────────────────────────────────────────
// CLIENTE WHATSAPP
// ─────────────────────────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "auth_whatsapp" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu"],
  },
});

client.on("qr", async (qr) => {
  console.log("📱 QR generado — escanea desde el dashboard");
  qrCodeBase64 = await qrcode.toDataURL(qr);
  botEstado    = "esperando_qr";
});

client.on("ready", () => {
  console.log("✅ WhatsApp Bot conectado!");
  botEstado    = "conectado";
  qrCodeBase64 = null;
});

client.on("disconnected", (reason) => {
  console.log("❌ WhatsApp desconectado:", reason);
  botEstado    = "desconectado";
  qrCodeBase64 = null;
  setTimeout(() => client.initialize(), 5000);
});

client.on("auth_failure", () => {
  console.log("❌ Error de autenticacion — borra auth_whatsapp y reinicia");
  botEstado = "error_auth";
});

// ─────────────────────────────────────────────────────────────
// HANDLER PRINCIPAL — TEXTO + VOZ
// ─────────────────────────────────────────────────────────────
client.on("message", async (msg) => {
  if (msg.from.includes("@g.us"))      return;
  if (msg.from.includes("@broadcast")) return;
  if (msg.isGroupMsg)                  return;
  if (msg.fromMe)                      return;

  try {
    const chat = await msg.getChat();
    let textoUsuario = "";
    let esVoz        = false;

    if (msg.type === "ptt" || msg.type === "audio") {
      esVoz = true;
      console.log(`🎙️ ${msg.from}: [NOTA DE VOZ]`);
      await chat.sendStateRecording();
      try {
        textoUsuario = await transcribirAudio(msg);
        if (!textoUsuario?.trim()) {
          await msg.reply("🎙️ No pude entender el audio. ¿Podrías repetirlo más claro o escribirlo?");
          return;
        }
        console.log(`🎙️ Transcripcion: "${textoUsuario}"`);
      } catch (err) {
        await msg.reply("❌ Error al procesar el audio. Intenta escribir tu consulta.");
        return;
      }
    } else if (msg.body?.trim()) {
      textoUsuario = msg.body.trim();
      console.log(`📩 ${msg.from}: "${textoUsuario.substring(0, 60)}"`);
    } else {
      return;
    }

    await chat.sendStateTyping();
    const respuesta = await procesarMensaje(textoUsuario, esVoz);

    if (esVoz && VOZ_HABILITADA) {
      const mensajeTexto = VOZ_SOLO_AUDIO
        ? respuesta
        : `🎙️ _Entendí: "${textoUsuario}"_\n\n${respuesta}`;
      await msg.reply(mensajeTexto);
    } else {
      await msg.reply(respuesta);
    }

    console.log(`✅ Respuesta enviada a ${msg.from}${esVoz ? " (voz→texto)" : ""}`);
  } catch (err) {
    console.error("Error en handler:", err.message);
    try { await msg.reply("Ocurrió un error. Intenta de nuevo."); } catch {}
  }
});

// ─────────────────────────────────────────────────────────────
// LIMPIEZA ARCHIVOS TEMPORALES
// ─────────────────────────────────────────────────────────────
setInterval(() => {
  try {
    if (!fs.existsSync(TEMP_DIR)) return;
    const ahora = Date.now();
    fs.readdirSync(TEMP_DIR).forEach(file => {
      const filePath = path.join(TEMP_DIR, file);
      if (ahora - fs.statSync(filePath).mtimeMs > 5 * 60 * 1000) fs.unlinkSync(filePath);
    });
  } catch {}
}, 60000);

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
function getQR()     { return qrCodeBase64; }
function getEstado() { return botEstado;    }

async function iniciarBot() {
  console.log("🤖 Iniciando WhatsApp Bot...");
  console.log("🎙️  Modo voz:", VOZ_HABILITADA ? "ACTIVADO" : "DESACTIVADO");
  try { client.initialize(); } catch (err) { console.error("Error iniciando bot:", err.message); }
}

module.exports = { iniciarBot, getQR, getEstado };