// backend/src/bot/whatsapp.js
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode  = require("qrcode");
const db      = require("../db");
const { chatbot } = require("../controllers/chatController");
const fs      = require("fs");
const path    = require("path");
const Groq    = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
// REGISTRAR PRODUCTO EN MYSQL → aparece en Dashboard
// ─────────────────────────────────────────────────────────────
async function registrarProductoEnBD(categoria, marca, modelo, precio, stock, origen) {
  const data = JSON.stringify({
    categoria:    `${marca.trim()} ${modelo.trim()}`,
    modelo:       modelo.trim(),
    precio_venta: Number(precio) || 0,
    cantidad:     Number(stock)  || 0,
  });
  await db.query(
    `INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES (?, ?, ?, ?, ?)`,
    [origen || "whatsapp", categoria.trim(), 0, data, null]
  );
  return {
    categoria: categoria.trim(),
    marca:     marca.trim(),
    modelo:    modelo.trim(),
    precio:    Number(precio) || 0,
    stock:     Number(stock)  || 0,
  };
}

// ─────────────────────────────────────────────────────────────
// EXTRAER DATOS DE REGISTRO CON IA (para voz en lenguaje natural)
// ─────────────────────────────────────────────────────────────
async function extraerDatosRegistro(textoVoz) {
  try {
    const prompt = `Eres un asistente de Eagle Gaming Peru. El usuario quiere registrar un producto en el inventario.

Extrae los datos del siguiente mensaje y responde SOLO con este formato exacto (sin explicaciones):
REGISTRAR|categoria|marca|modelo|precio|stock

Categorias validas: Tarjeta de Video, Procesadores, Monitores, RAM, Disco SSD, Placa Madre, Case, Fuente de poder, Laptops, Estabilizador, Perifericos

Mensaje del usuario: "${textoVoz}"

Si no puedes extraer TODOS los datos necesarios, responde exactamente: DATOS_INCOMPLETOS
Si el precio o stock no se menciona, usa 0.`;

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
// CARGAR INVENTARIO REAL DESDE MYSQL
// ─────────────────────────────────────────────────────────────
async function cargarInventario() {
  try {
    const [rows] = await db.query(
      "SELECT id, sheet_name, data FROM excel_records ORDER BY sheet_name, id"
    );
    return rows.map((r, i) => {
      let parsed = {};
      try { parsed = typeof r.data === "string" ? JSON.parse(r.data) : r.data; } catch {}
      const catRaw    = String(parsed.categoria || "");
      const marcaReal = catRaw
        .replace(/^(monitor|procesador|tarjeta de video|tarjeta grafica|placa madre|case|ram|memoria|ssd|disco|fuente|laptop|estabilizador|periferico|audifono|audifonos|mouse|teclado|combo|kit|webcam|camara)\s*/i, "")
        .trim().split(" ")[0] || "—";
      return {
        id:        i + 1,
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
// MAPA DE CATEGORIAS
// ─────────────────────────────────────────────────────────────
const MAPA_CATEGORIAS = {
  "monitor":      ["Monitores", "Monitor"],
  "monitores":    ["Monitores", "Monitor"],
  "gpu":          ["Tarjeta de Vídeo", "Tarjeta de Video"],
  "tarjeta":      ["Tarjeta de Vídeo", "Tarjeta de Video"],
  "grafica":      ["Tarjeta de Vídeo", "Tarjeta de Video"],
  "video":        ["Tarjeta de Vídeo", "Tarjeta de Video"],
  "procesador":   ["Procesadores", "Procesador"],
  "procesadores": ["Procesadores", "Procesador"],
  "cpu":          ["Procesadores", "Procesador"],
  "ram":          ["RAM"],
  "memoria":      ["RAM"],
  "ssd":          ["Disco SSD"],
  "disco":        ["Disco SSD"],
  "placa":        ["Placa Madre"],
  "motherboard":  ["Placa Madre"],
  "case":         ["Case"],
  "gabinete":     ["Case"],
  "fuente":       ["Fuente de poder"],
  "psu":          ["Fuente de poder"],
  "laptop":       ["Laptops", "Laptop"],
  "laptops":      ["Laptops", "Laptop"],
  "estabilizador":["Estabilizador"],
  "periferico":   ["Perifericos", "Periferico"],
  "perifericos":  ["Perifericos", "Periferico"],
  "mouse":        ["Perifericos"],
  "teclado":      ["Perifericos"],
  "audifono":     ["Perifericos"],
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
// PROCESAR MENSAJE (texto o voz transcrita)
// ─────────────────────────────────────────────────────────────
async function procesarMensaje(texto, esVoz = false) {
  const txt        = texto.trim().toLowerCase();
  const inventario = await cargarInventario();

  // ── 1. REGISTRO FORMATO DIRECTO: REGISTRAR|...|...|...|...|... ──
  if (texto.toUpperCase().startsWith("REGISTRAR|")) {
    const partes = texto.split("|");
    if (partes.length >= 6) {
      const [, categoria, marca, modelo, precio, stock] = partes;
      try {
        await registrarProductoEnBD(categoria, marca, modelo, precio, stock, esVoz ? "whatsapp-voz" : "whatsapp");
        return `✅ Producto registrado en el inventario:\n• Categoria: ${categoria.trim()}\n• Marca: ${marca.trim()}\n• Modelo: ${modelo.trim()}\n• Precio: S/${precio.trim()}\n• Stock: ${stock.trim()} unidades\n\n📊 Ya aparece en el Dashboard de Eagle Gaming.`;
      } catch (err) {
        console.error("Error registrando:", err.message);
        return `❌ Error al registrar. Formato correcto:\nREGISTRAR|categoria|marca|modelo|precio|stock`;
      }
    }
    return `❌ Formato incorrecto. Ejemplo:\nREGISTRAR|Procesadores|AMD|Ryzen 5 5600|490|10`;
  }

  // ── 2. REGISTRO POR VOZ EN LENGUAJE NATURAL ──────────────────
  if (esVoz && (txt.includes("registrar") || txt.includes("agregar") || txt.includes("añadir") || txt.includes("agregar"))) {
    console.log("🎙️ Detectado intento de registro por voz:", texto);
    const iaResultado = await extraerDatosRegistro(texto);

    if (iaResultado.toUpperCase().startsWith("REGISTRAR|")) {
      const partes = iaResultado.split("|");
      if (partes.length >= 6) {
        const [, categoria, marca, modelo, precio, stock] = partes;
        try {
          await registrarProductoEnBD(categoria, marca, modelo, precio, stock, "whatsapp-voz");
          return `✅ Producto registrado por voz:\n• Categoria: ${categoria.trim()}\n• Marca: ${marca.trim()}\n• Modelo: ${modelo.trim()}\n• Precio: S/${precio.trim()}\n• Stock: ${stock.trim()} unidades\n\n📊 Ya aparece en el Dashboard de Eagle Gaming.`;
        } catch (err) {
          console.error("Error registrando por voz:", err.message);
          return `❌ Error al guardar. Intenta de nuevo diciendo:\n"Registrar [categoria] [marca] [modelo] precio [monto] stock [cantidad]"`;
        }
      }
    }

    return `🎙️ No pude extraer todos los datos. Di algo como:\n\n"Registrar procesadores AMD Ryzen 7 5800X precio 850 stock 5"\n\nO escribe el formato:\nREGISTRAR|Procesadores|AMD|Ryzen 7 5800X|850|5`;
  }

  // ── 3. CONSULTA DE CUANTOS HAY EN UNA CATEGORIA ──────────────
  if (txt.includes("cuantos") || txt.includes("cuántos") || txt.includes("hay") || txt.includes("tienen") || txt.includes("tienes")) {
    const resultado = buscarCategoria(txt, inventario);
    if (resultado) {
      const { clave, prods } = resultado;
      const conStock = prods.filter(p => p.stock > 0);
      const sinStock = prods.filter(p => p.stock === 0);
      const precios  = prods.map(p => p.precio).filter(p => p > 0);
      const pMin = precios.length ? Math.min(...precios) : 0;
      const pMax = precios.length ? Math.max(...precios) : 0;
      return `${clave.charAt(0).toUpperCase()+clave.slice(1)} en catalogo: ${prods.length} modelos\n• Con stock: ${conStock.length}\n• Sin stock: ${sinStock.length}\n• Precios: S/${pMin} - S/${pMax}\n\nEscribe /lista ${clave} para ver todos los modelos con precio.`;
    }
  }

  // ── 4. LISTAR MODELOS CON MARCA Y PRECIO ─────────────────────
  if (txt.startsWith("/lista") || txt.startsWith("lista ") || txt.includes("lista de") || txt.includes("modelos de") || txt.includes("que modelos") || txt.includes("qué modelos")) {
    const resultado = buscarCategoria(txt, inventario);
    if (resultado) {
      const { clave, prods } = resultado;
      const lista = prods.map(p =>
        `• ${p.marca} ${p.modelo} — S/${p.precio}${p.stock > 0 ? ` (stock: ${p.stock})` : " (sin stock)"}`
      ).join("\n");
      return `${clave.charAt(0).toUpperCase()+clave.slice(1)} (${prods.length} modelos):\n${lista}`;
    }
  }

  // ── 5. BUSCAR PRECIO DE UN MODELO ESPECIFICO ─────────────────
  if (txt.includes("cuanto cuesta") || txt.includes("cuánto cuesta") || txt.includes("precio de") || txt.includes("precio del") || txt.includes("precio")) {
    const palabras = txt
      .replace(/cuanto cuesta|cuánto cuesta|precio de|precio del|precio|el|la|los|las|\?/g, "")
      .trim().split(" ").filter(p => p.length > 2);
    if (palabras.length > 0) {
      const encontrados = inventario.filter(p =>
        palabras.some(pal => p.modelo.toLowerCase().includes(pal) || p.marca.toLowerCase().includes(pal))
      );
      if (encontrados.length > 0) {
        const lista = encontrados.slice(0, 5).map(p =>
          `• ${p.marca} ${p.modelo} — S/${p.precio}${p.stock > 0 ? ` (stock: ${p.stock})` : " (sin stock)"}`
        ).join("\n");
        return `Productos encontrados:\n${lista}`;
      }
    }
  }

  // ── 6. COMANDOS RAPIDOS ───────────────────────────────────────
  if (txt === "/ayuda" || txt === "ayuda" || txt === "menu") {
    return `🦅 Eagle Bot — Eagle Gaming Peru\n\nComandos:\n/inventario — resumen general\n/lista [categoria] — modelos con marca y precio\n/precios [categoria] — precios rapidos\n/buscar [termino] — buscar producto\n\nEjemplos:\n• "Cuantos monitores hay?"\n• "Lista de procesadores"\n• "Cuanto cuesta el Ryzen 5 5500?"\n\n🎙️ Tambien puedes enviar notas de voz!\n\nPara registrar (texto):\nREGISTRAR|categoria|marca|modelo|precio|stock\n\nPara registrar (voz):\n"Registrar procesadores AMD Ryzen 5 5600 precio 490 stock 5"`;
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
    return `🦅 Inventario Eagle Gaming Peru\nTotal: ${inventario.length} productos | Stock: ${stockTotal} ud | Valor: S/${valorTotal.toLocaleString()}\n\n${resumen}`;
  }

  if (txt.startsWith("/buscar")) {
    const termino = txt.replace("/buscar", "").trim();
    if (!termino) return `Uso: /buscar [termino]\nEj: /buscar RTX 4060`;
    const encontrados = inventario.filter(p =>
      p.modelo.toLowerCase().includes(termino) ||
      p.marca.toLowerCase().includes(termino)   ||
      p.categoria.toLowerCase().includes(termino)
    );
    if (encontrados.length === 0) return `No encontre productos con "${termino}".`;
    const lista = encontrados.slice(0, 8).map(p =>
      `• ${p.marca} ${p.modelo} — S/${p.precio}${p.stock > 0 ? ` (stock: ${p.stock})` : " (sin stock)"}`
    ).join("\n");
    return `Resultados para "${termino}" (${encontrados.length}):\n${lista}`;
  }

  if (txt.startsWith("/precios")) {
    const cat      = txt.replace("/precios", "").trim();
    const resultado = buscarCategoria(cat || txt, inventario);
    if (resultado) {
      const { clave, prods } = resultado;
      const lista = prods.slice(0, 10).map(p => `• ${p.marca} ${p.modelo} S/${p.precio}`).join("\n");
      return `Precios ${clave}:\n${lista}`;
    }
    return `Categorias: monitor, gpu, procesador, ram, ssd, placa, case, fuente, laptop\nEj: /precios monitor`;
  }

  // ── 7. SALUDOS ────────────────────────────────────────────────
  if (["hola","buenos dias","buenas tardes","buenas noches","buenas","hey","buen dia"].some(s => txt.includes(s))) {
    return `Hola! Soy Eagle Bot de Eagle Gaming Peru.\n\nTenemos ${inventario.length} productos en catalogo.\n\n🎙️ Puedes escribirme o enviarme notas de voz!\n\nEscribe /ayuda para ver todos los comandos.`;
  }

  if (["gracias","ok gracias","perfecto","listo","genial"].some(s => txt.includes(s))) {
    return `Con gusto! Si necesitas algo mas, aqui estoy.`;
  }

  // ── 8. PREGUNTA LIBRE → IA ────────────────────────────────────
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
    iaRespuesta = "No pude responder ahora. Escribe /ayuda para ver los comandos.";
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
  console.log("📱 QR generado — escanea desde el dashboard o navegador");
  qrCodeBase64 = await qrcode.toDataURL(qr);
  botEstado    = "esperando_qr";
});

client.on("ready", () => {
  console.log("✅ WhatsApp Bot conectado!");
  console.log("🎙️  Modo voz:", VOZ_HABILITADA ? "ACTIVADO" : "DESACTIVADO");
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

    // ── NOTA DE VOZ ──────────────────────────────────────────
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
        console.error("Error procesando voz:", err.message);
        await msg.reply("❌ Error al procesar el audio. Intenta escribir tu consulta.");
        return;
      }

    // ── TEXTO NORMAL ─────────────────────────────────────────
    } else if (msg.body?.trim()) {
      textoUsuario = msg.body.trim();
      console.log(`📩 ${msg.from}: "${textoUsuario.substring(0, 60)}"`);
    } else {
      return; // Ignorar imágenes, stickers, etc.
    }

    // ── PROCESAR Y RESPONDER ──────────────────────────────────
    await chat.sendStateTyping();
    const respuesta = await procesarMensaje(textoUsuario, esVoz);

    if (esVoz && VOZ_HABILITADA) {
      // Si fue nota de voz → responder con texto mostrando transcripcion
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
    try { await msg.reply("Ocurrio un error. Intenta de nuevo."); } catch {}
  }
});

// ─────────────────────────────────────────────────────────────
// LIMPIEZA PERIODICA DE ARCHIVOS TEMPORALES
// ─────────────────────────────────────────────────────────────
setInterval(() => {
  try {
    if (!fs.existsSync(TEMP_DIR)) return;
    const ahora = Date.now();
    fs.readdirSync(TEMP_DIR).forEach(file => {
      const filePath = path.join(TEMP_DIR, file);
      if (ahora - fs.statSync(filePath).mtimeMs > 5 * 60 * 1000) {
        fs.unlinkSync(filePath);
      }
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
  try {
    client.initialize();
  } catch (err) {
    console.error("Error iniciando bot:", err.message);
  }
}

module.exports = { iniciarBot, getQR, getEstado };