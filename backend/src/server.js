require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRoutes        = require("./routes/auth");
const excelRoutes       = require("./routes/excel");
const movimientosRoutes = require("./routes/movimientos");
const proveedoresRoutes = require("./routes/proveedores");
const chatRoutes        = require("./routes/chat");
const { iniciarBot, getQR, getEstado } = require("./bot/whatsapp");

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",        authRoutes);
app.use("/api/excel",       excelRoutes);
app.use("/api/movimientos", movimientosRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/chat",        chatRoutes);

// ── WhatsApp QR endpoints ──
app.get("/api/whatsapp/qr", (req, res) => {
  res.json({ qr: getQR(), estado: getEstado() });
});

app.get("/api/whatsapp/qr-view", (req, res) => {
  const qr = getQR();
  if (!qr) return res.send("<h2 style='font-family:sans-serif'>Bot ya conectado ✅</h2>");
  res.send(`
    <html>
      <body style="background:#0a0a0f;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;margin:0">
        <h2 style="color:white;font-family:sans-serif;margin-bottom:20px">📱 Eagle Gaming — Vincular WhatsApp</h2>
        <img src="${qr}" style="width:280px;border-radius:12px;background:white;padding:16px"/>
        <p style="color:#6b6b80;font-family:sans-serif;margin-top:16px;text-align:center">
          WhatsApp → 3 puntos → Dispositivos vinculados → Vincular dispositivo
        </p>
        <p style="color:#34d399;font-family:sans-serif;font-size:12px">
          Recarga la página si el QR expira
        </p>
      </body>
    </html>
  `);
});

app.get("/api/health", (req, res) => res.json({ status: "ok", ts: new Date() }));
app.use((req, res)          => res.status(404).json({ message: "Ruta no encontrada" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
});

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));

// ── Bot WhatsApp al final ──
iniciarBot().catch(console.error);