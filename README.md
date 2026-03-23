<div align="center">

# 🦅 EAGLE GAMING SYSTEM

![Banner](https://capsule-render.vercel.app/api?type=waving&color=6c63ff&height=200&section=header&text=Eagle%20Gaming%20System&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Sistema%20Web%20de%20Gestion%20de%20Inventario%20Gaming&descAlignY=55&descAlign=50)

<br/>

[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Chart.js](https://img.shields.io/badge/Charts-Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://chartjs.org/)
[![Groq](https://img.shields.io/badge/IA-Groq%20Llama-orange?style=for-the-badge)](https://groq.com/)
[![WhatsApp](https://img.shields.io/badge/Bot-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://github.com/pedroslopez/whatsapp-web.js)

<br/>

> **Eagle Gaming System** es un sistema web completo de gestion de inventario para **Eagle Gaming Peru**. Administra **125 productos** en **11 categorias** con IA integrada (Groq + Llama 3.1), bot de WhatsApp y 16 graficos interactivos en tiempo real.

</div>

---

## 📌 Tabla de Contenidos

- [Caracteristicas](#-caracteristicas)
- [Stack Tecnologico](#-stack-tecnologico)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Flujo de Datos](#-flujo-de-datos)
- [Backend — Detalle Tecnico](#-backend--detalle-tecnico)
- [Frontend — Detalle Tecnico](#-frontend--detalle-tecnico)
- [Base de Datos](#-base-de-datos)
- [API Endpoints con Ejemplos](#-api-endpoints-con-ejemplos)
- [Guia del Chatbot IA](#-guia-del-chatbot-ia)
- [Bot de WhatsApp](#-bot-de-whatsapp)
- [Fases de Desarrollo](#-fases-de-desarrollo)
- [Instalacion](#-instalacion)
- [Equipo](#-equipo)

---

## ✨ Caracteristicas

<table>
<tr>
<td width="50%">

**🔐 Autenticacion y Seguridad**
- Login con JWT y roles admin/user
- Rutas protegidas con PrivateRoute
- Middleware de verificacion en backend
- Passwords encriptados con bcryptjs

**📦 Gestion de Inventario**
- 125 productos importados desde Excel
- 11 categorias de hardware gaming
- Buscador en tiempo real por modelo/marca/categoria
- Agregar, Editar y Eliminar productos
- Al reimportar Excel reemplaza sin duplicar
- Guardado persistente en MySQL

**📊 Graficos y Visualizaciones**
- 16 graficos interactivos con Chart.js
- Barras, Doughnut, Pie, Linea, Radar
- Polar Area, Bubble, Acumulado, Top 5
- Vista de impresion limpia blanco/negro

</td>
<td width="50%">

**📥 Operaciones y Proveedores**
- Registro de entradas y salidas de stock
- Historial con filtro por rango de fechas
- Alertas de stock minimo (5 unidades)
- CRUD completo de proveedores

**🤖 Chatbot con IA**
- Groq API con Llama 3.1-8b-instant (gratis)
- Responde por Categoria, Marca, Modelo, Precio, Stock y Valor Total
- Registrar productos con lenguaje natural
- Datos en tiempo real del sistema

**📱 Bot de WhatsApp**
- whatsapp-web.js sin costo adicional
- QR visible dentro del chatbot del dashboard
- Comandos rapidos y preguntas libres con IA
- Registro de productos desde WhatsApp

</td>
</tr>
</table>

---

## 🛠️ Stack Tecnologico

```
┌─────────────────────────────────────────────────────────────┐
│                    EAGLE GAMING SYSTEM                        │
├──────────────────┬──────────────────────────────────────────┤
│  FRONTEND        │  React 18 + Vite 5 + Chart.js 4          │
│  BACKEND         │  Node.js 18 + Express 4 (MVC)            │
│  BASE DE DATOS   │  MySQL 5.7 + mysql2 (connection pool)    │
│  AUTH            │  JWT (jsonwebtoken) + bcryptjs            │
│  EXCEL           │  multer (file upload) + xlsx (parse)     │
│  IA CHATBOT      │  Groq API + llama-3.1-8b-instant         │
│  WHATSAPP BOT    │  whatsapp-web.js + puppeteer              │
│  QR CODE         │  qrcode (base64 para dashboard)          │
│  ESTILOS         │  CSS Variables + Google Fonts + DM Mono  │
│  VERSIONES       │  Git + GitHub                             │
└──────────────────┴──────────────────────────────────────────┘
```

---

## 🏗️ Arquitectura del Proyecto

```
eagle-gaming-system/
│
├── 📁 backend/                          # Servidor Node.js + Express
│   ├── 📁 src/
│   │   ├── 📁 bot/
│   │   │   └── 🟨 whatsapp.js          # Bot WhatsApp + QR + comandos + IA
│   │   ├── 📁 controllers/
│   │   │   ├── 🟨 authController.js    # Login, validacion, JWT
│   │   │   ├── 🟨 chatController.js    # IA Groq, contexto inventario
│   │   │   ├── 🟨 excelController.js   # Importar Excel, CRUD productos
│   │   │   ├── 🟨 movimientosController.js  # Entradas/salidas stock
│   │   │   └── 🟨 proveedoresController.js  # CRUD proveedores
│   │   ├── 📁 middleware/
│   │   │   └── 🟨 auth.js              # verifyToken, proteccion rutas
│   │   ├── 📁 routes/
│   │   │   ├── 🟨 auth.js
│   │   │   ├── 🟨 chat.js
│   │   │   ├── 🟨 excel.js
│   │   │   ├── 🟨 movimientos.js
│   │   │   └── 🟨 proveedores.js
│   │   ├── 🟨 db.js                    # Pool de conexiones MySQL
│   │   └── 🟨 server.js               # Entry point, middlewares, rutas
│   ├── 📄 schema.sql                   # Estructura completa de la BD
│   ├── 📄 .env.example                 # Variables de entorno requeridas
│   └── 📄 package.json
│
└── 📁 frontend/                         # React + Vite
    ├── 📁 src/
    │   ├── 📁 pages/
    │   │   ├── 🟦 Dashboard.jsx        # Vista principal (inventario, graficos, etc)
    │   │   └── 🟦 login.jsx            # Formulario de autenticacion
    │   ├── 📁 context/
    │   │   └── 🟦 AuthContext.jsx      # Estado global: token, user, login/logout
    │   ├── 📁 components/
    │   │   └── 🟦 PrivateRoute.jsx     # Proteccion de rutas con redirect
    │   ├── 🟦 App.jsx                  # Router: / → login, /dashboard → Dashboard
    │   └── 🟦 main.jsx                 # Entry point React
    ├── 📄 .env                         # VITE_API_URL
    └── 📄 package.json
```

---

## 🔄 Flujo de Datos

### Flujo de Autenticacion

```
Usuario ingresa email + password
          ↓
Frontend → POST /api/auth/login
          ↓
Backend valida credenciales en MySQL
          ↓
bcryptjs.compare(password, hash)
          ↓
jwt.sign({ id, email, role }) → Token JWT
          ↓
Frontend guarda token en AuthContext
          ↓
Todas las peticiones incluyen: Authorization: Bearer <token>
          ↓
Middleware auth.js verifica jwt.verify(token, JWT_SECRET)
          ↓
req.user = { id, email, role } → Continua al controller
```

---

### Flujo de Importacion de Excel

```
Usuario selecciona archivo .xlsx
          ↓
Frontend → POST /api/excel/importar (multipart/form-data)
          ↓
multer guarda el archivo en memoria (buffer)
          ↓
xlsx.read(buffer) → Lee las 11 hojas del Excel
          ↓
DELETE excel_records WHERE filename != 'manual'  ← limpia duplicados
          ↓
Por cada hoja: lee filas → valida precio > 0 → INSERT en excel_records
          ↓
Responde: { total: 125, message: "Excel importado" }
          ↓
Frontend recarga la tabla con los nuevos datos
```

---

### Flujo del Chatbot IA

```
Usuario escribe pregunta en el chat
          ↓
Frontend envia: { mensaje, inventario[], movimientos[], proveedores[] }
          ↓
POST /api/chat  →  chatController.js
          ↓
Calcula estadisticas reales:
  totalProductos, stockTotal, valorTotal, categorias
          ↓
Construye contexto con datos reales del inventario
          ↓
Groq API → llama-3.1-8b-instant (max_tokens: 250)
          ↓
Responde con datos exactos del catalogo
          ↓
Frontend muestra respuesta en el chat
```

---

### Flujo del Bot de WhatsApp

```
Servidor inicia → client.initialize()
          ↓
whatsapp-web.js genera QR (base64)
          ↓
GET /api/whatsapp/qr → Dashboard muestra QR
          ↓
Usuario escanea con WhatsApp → Bot conectado
          ↓
Mensaje entrante detectado por client.on("message")
          ↓
¿Empieza con REGISTRAR|? → INSERT en MySQL
¿Es /inventario, /precios, /buscar? → Respuesta directa
¿Pregunta libre? → Llama a chatController (IA)
          ↓
bot.reply(respuesta) → WhatsApp
```

---

## ⚙️ Backend — Detalle Tecnico

### `server.js` — Entry Point

```javascript
// Orden de configuracion:
1. require("dotenv").config()           // Carga .env
2. express() + cors() + json()          // Middlewares globales
3. app.use("/api/auth", authRoutes)     // Rutas publicas
4. app.use("/api/excel", excelRoutes)   // Rutas protegidas
5. app.use("/api/chat", chatRoutes)     // Chatbot IA
6. app.use("/api/whatsapp/qr", ...)     // QR WhatsApp
7. app.listen(PORT)                     // Puerto 4000
8. iniciarBot()                         // WhatsApp al final
```

---

### `authController.js` — Autenticacion

```javascript
// login(req, res)
// 1. Busca usuario por email en MySQL
// 2. bcryptjs.compare(password, user.password_hash)
// 3. jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: "8h" })
// 4. Responde: { token, user: { id, name, email, role } }
```

---

### `excelController.js` — Inventario

```javascript
// importarExcel(req, res)
// 1. multer recibe el archivo en memoria
// 2. DELETE excel_records WHERE filename != 'manual'
// 3. Lee 11 hojas: Tarjeta de Video, Case, Placa Madre...
// 4. Por cada fila valida: categoria, modelo, precio > 0
// 5. INSERT en excel_records con data en JSON
// Retorna: { total: 125 }

// obtenerProductos(req, res)
// 1. SELECT * FROM excel_records ORDER BY sheet_name
// 2. JSON.parse(row.data) para cada registro
// 3. Retorna: { productos: [...] }

// agregarProducto / eliminarProducto
// INSERT o DELETE directo en excel_records
```

---

### `chatController.js` — IA

```javascript
// chatbot(req, res)
// Recibe: { mensaje, inventario[], movimientos[], proveedores[] }
// 1. Calcula estadisticas reales del inventario recibido
// 2. Construye lista completa: Categoria|Marca|Modelo|Precio|Stock|Valor
// 3. Arma contexto con datos reales (no estaticos)
// 4. client.chat.completions.create({ model: "llama-3.1-8b-instant" })
// 5. Retorna: { respuesta: "texto de la IA" }
```

---

### `whatsapp.js` — Bot

```javascript
// procesarMensaje(texto)
// REGISTRAR|...  → INSERT en MySQL
// /ayuda         → Menu de comandos
// /inventario    → Resumen por categorias
// /precios [cat] → Lista de precios
// /buscar [prod] → Buscar en catalogo
// texto libre    → Llama a chatController (IA)

// iniciarBot()
// client.initialize() → genera QR
// client.on("qr")     → guarda base64 para el dashboard
// client.on("ready")  → bot conectado
// client.on("message") → procesarMensaje()
```

---

### `db.js` — Conexion MySQL

```javascript
// Pool de conexiones (no una sola conexion)
// connectionLimit: 10  → hasta 10 consultas simultaneas
// waitForConnections: true → cola si todas ocupadas
// enableKeepAlive: true → mantiene conexion activa
```

---

## 🎨 Frontend — Detalle Tecnico

### `AuthContext.jsx` — Estado Global

```javascript
// Provee a toda la app:
// token    → JWT guardado en memoria
// user     → { id, name, email, role }
// login()  → POST /api/auth/login → guarda token
// logout() → limpia token → redirige a /

// Uso en cualquier componente:
const { token, user, logout } = useContext(AuthContext);
```

---

### `App.jsx` — Rutas

```javascript
// / → <Login />
// /dashboard → <PrivateRoute><Dashboard /></PrivateRoute>
// Cualquier otra ruta → redirect a /
```

---

### `PrivateRoute.jsx` — Proteccion

```javascript
// Si hay token → renderiza el componente
// Si no hay token → <Navigate to="/" />
```

---

### `Dashboard.jsx` — Vista Principal

El archivo principal del frontend. Contiene:

```
Estados principales:
  datos[]        → productos del inventario (cargados de MySQL)
  movimientos[]  → entradas/salidas
  proveedores[]  → lista de proveedores
  waQR           → imagen QR del bot de WhatsApp (base64)
  waEstado       → "desconectado" | "esperando_qr" | "conectado"

Secciones del dashboard:
  📦 Inventario  → tabla editable con busqueda y filtros
  📊 Graficos    → componente Graficos con 16 charts
  📥 Entradas    → formulario + tabla de movimientos
  🏢 Proveedores → formulario + tabla de proveedores

Funciones clave:
  cargarProductos()    → GET /api/excel/productos
  handleImportarExcel() → POST /api/excel/importar
  handleSend()          → POST /api/chat (chatbot IA)
  verificarWhatsApp()   → GET /api/whatsapp/qr (cada 10s)
  registrarVenta()      → actualiza stock en tiempo real
```

---

### `Graficos.jsx` — Componente de Charts

```javascript
// Recibe: datos[] del inventario
// Calcula por categoria:
//   counts, stocks, valores, precios, precMin, avg, acum, top5
// Renderiza 16 canvas con Chart.js
// Destruye los charts al desmontar (evita memory leaks)
// Se recalcula cuando cambian los datos
```

---

## 🗄️ Base de Datos

### Esquema Completo

```sql
CREATE DATABASE IF NOT EXISTS dashboard_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usuarios del sistema
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','user') DEFAULT 'user',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Productos del inventario
CREATE TABLE excel_records (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename    VARCHAR(255),
  sheet_name  VARCHAR(100),
  row_index   INT DEFAULT 0,
  data        JSON NOT NULL,
  uploaded_by INT UNSIGNED,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Movimientos de stock
CREATE TABLE movimientos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fecha       VARCHAR(20),
  producto    VARCHAR(255),
  tipo        ENUM('Entrada','Salida') DEFAULT 'Entrada',
  cantidad    INT DEFAULT 0,
  costo       DECIMAL(10,2) DEFAULT 0,
  responsable VARCHAR(120),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proveedores
CREATE TABLE proveedores (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(200) NOT NULL,
  producto   VARCHAR(255),
  precio     VARCHAR(100),
  entrega    VARCHAR(100),
  contacto   VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuario admin por defecto
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (
  'Administrador',
  'admin@empresa.com',
  '$2a$12$KIXIhk3xjDCbLoEZqEpKuuaI7UYoFiJjb9ZhKz8skNAuwQgUKOTiq',
  'admin'
);
```

### Estructura del campo `data` en `excel_records`

```json
{
  "categoria":     "Tarjeta de Video",
  "modelo":        "Radeon RX 9070 XT OC Edition",
  "precio_venta":  3299,
  "precio_min":    null,
  "precio_compra": null,
  "cantidad":      5
}
```

---

## 📡 API Endpoints con Ejemplos

### 🔐 POST `/api/auth/login`

```json
// Request
{
  "email":    "admin@empresa.com",
  "password": "password"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id":    1,
    "name":  "Administrador",
    "email": "admin@empresa.com",
    "role":  "admin"
  }
}

// Response 401
{ "message": "Credenciales incorrectas" }
```

---

### 📦 GET `/api/excel/productos`

```json
// Headers: Authorization: Bearer <token>

// Response 200
{
  "total": 125,
  "productos": [
    {
      "id":         1,
      "categoria":  "Tarjeta de Video",
      "modelo":     "Radeon RX 9070 XT OC Edition",
      "precio_venta": 3299,
      "cantidad":   5,
      "created_at": "2026-03-21T10:00:00"
    }
  ]
}
```

---

### 📦 POST `/api/excel/importar`

```
// Headers: Authorization: Bearer <token>
// Body: multipart/form-data
// Campo: excel = archivo.xlsx

// Response 200
{
  "message": "Excel importado correctamente",
  "total":   125
}
```

---

### 📦 POST `/api/excel/agregar`

```json
// Request
{
  "categoria": "Procesadores",
  "marca":     "AMD",
  "modelo":    "Ryzen 7 5800X",
  "precio":    850,
  "stock":     5
}

// Response 201
{
  "message": "Producto guardado",
  "id":      128
}
```

---

### 📥 POST `/api/movimientos/agregar`

```json
// Request
{
  "fecha":       "2026-03-21",
  "producto":    "RTX 5070 WINDFORCE OC",
  "tipo":        "Entrada",
  "cantidad":    3,
  "costo":       8760,
  "responsable": "Elias"
}

// Response 201
{ "message": "Movimiento registrado", "id": 15 }
```

---

### 🏢 POST `/api/proveedores/agregar`

```json
// Request
{
  "nombre":   "TechParts SAC",
  "producto": "Tarjetas de Video",
  "precio":   "S/1200 - S/3000",
  "entrega":  "3-5 dias",
  "contacto": "ventas@techparts.pe"
}

// Response 201
{ "message": "Proveedor guardado", "id": 8 }
```

---

### 🤖 POST `/api/chat`

```json
// Request
{
  "mensaje":     "cuanto cuesta el Ryzen 5 5500?",
  "inventario":  [ { "categoria": "Procesadores", "modelo": "Ryzen 5 5500", "precio": 353, "stock": 0 } ],
  "movimientos": [],
  "proveedores": []
}

// Response 200
{
  "respuesta": "El AMD Ryzen 5 5500 tiene un precio de S/353. Actualmente tiene stock 0 — consulta disponibilidad con el administrador."
}
```

---

### 📱 GET `/api/whatsapp/qr`

```json
// Response cuando el QR esta disponible
{
  "qr":     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "estado": "esperando_qr"
}

// Response cuando ya esta conectado
{
  "qr":     null,
  "estado": "conectado"
}
```

---

## 🤖 Guia del Chatbot IA

El chatbot usa **Groq API con Llama 3.1-8b-instant** y tiene acceso a todos los datos reales del inventario en tiempo real.

### Preguntas sobre Estadisticas

```
✅ "cuantos productos tenemos en total?"
   → "Tenemos 127 productos registrados en el inventario."

✅ "cual es el stock total?"
   → "El stock total es de 84 unidades disponibles."

✅ "cual es el valor total del inventario?"
   → "El valor total en stock es S/38,035."

✅ "cuantas categorias hay?"
   → "Hay 61 categorias activas en el sistema."
```

### Preguntas sobre Precios

```
✅ "cuanto cuesta el Ryzen 5 5500?"
   → "El AMD Ryzen 5 5500 tiene un precio de S/353."

✅ "cual es la GPU mas cara?"
   → "La GPU mas cara es el ASUS Radeon RX 9070 XT OC a S/3,299."

✅ "que procesadores hay bajo S/500?"
   → "Ryzen 5 5500 S/353, i3-12100F S/350, Ryzen 5 5600GT S/569 aprox."

✅ "cuanto vale el monitor ASUS XG27AQDMG?"
   → "El ASUS XG27AQDMG tiene un precio de S/2,899."
```

### Preguntas sobre Categorias

```
✅ "cuantos productos hay en CASE?"
   → "Hay 10 productos en la categoria Case."

✅ "que marcas de procesadores tienen?"
   → "Tenemos AMD (Ryzen 5/7) e Intel (Core i3/i5/i7)."

✅ "cual es el valor total de los monitores?"
   → "El valor total en stock de Monitores es S/X,XXX."

✅ "que productos tienen stock disponible?"
   → Lista los productos con stock > 0.
```

### Preguntas de Recomendacion

```
✅ "tengo S/2000 para armar una PC gamer"
   → Recomienda: GPU, procesador, placa madre y RAM dentro del presupuesto.

✅ "que GPU me recomiendas para jugar a 1080p?"
   → Sugiere opciones segun rango de precio y disponibilidad.

✅ "arma una PC completa con S/3000"
   → Lista componentes compatibles con precios y total.
```

### Registrar Productos

```
✅ Lenguaje natural:
   "quiero registrar un producto nuevo"
   → "Para registrar escribe: REGISTRAR|categoria|marca|modelo|precio|stock"

✅ Formato directo:
   REGISTRAR|Procesadores|AMD|Ryzen 7 5800X|850|5
   → "Producto registrado: AMD Ryzen 7 5800X S/850, stock 5 unidades."
```

---

## 📱 Bot de WhatsApp

### Vincular el Bot

```
1. Levantar el servidor: node src/server.js
2. Abrir el chatbot en el dashboard
3. Escanear el QR que aparece dentro del chat
   WhatsApp → 3 puntos → Dispositivos vinculados → Vincular
4. Terminal muestra: "WhatsApp Bot conectado!"
```

### Comandos Disponibles

```
/ayuda               → Menu de todos los comandos
/inventario          → Resumen por categorias con precios
/precios procesador  → Lista de procesadores con precios
/precios monitor     → Lista de monitores con precios
/precios gpu         → Lista de tarjetas de video
/precios ram         → Lista de memorias RAM
/precios ssd         → Lista de discos SSD
/precios laptop      → Lista de laptops
/buscar RTX 4060     → Buscar producto especifico
/buscar Ryzen        → Todos los Ryzen disponibles
```

### Registrar Producto desde WhatsApp

```
Formato:
REGISTRAR|categoria|marca|modelo|precio|stock

Ejemplo:
REGISTRAR|Procesadores|AMD|Ryzen 7 5800X|850|5

Respuesta:
"Producto registrado en el inventario:
 • Categoria: Procesadores
 • Marca: AMD
 • Modelo: Ryzen 7 5800X
 • Precio: S/850
 • Stock: 5 unidades
 Ya aparece en el dashboard."
```

### Preguntas Libres con IA

```
"Hola, tienen RTX 4060?"
"Cuanto cuesta el mejor monitor gaming?"
"Que procesador va con una placa MSI B550?"
"Tengo S/1500 para una GPU, que me recomiendas?"
```

---

## 🗺️ Fases de Desarrollo

### ✅ Fase 1 — Base del Sistema `COMPLETADO`

| Funcionalidad | Estado |
|:-------------|:------:|
| Login con JWT y roles | ✅ |
| Base de datos MySQL | ✅ |
| Dashboard con sidebar | ✅ |
| Rutas protegidas | ✅ |

### ✅ Fase 2 — Inventario Completo `COMPLETADO`

| Funcionalidad | Estado |
|:-------------|:------:|
| Importar Excel (125 productos) | ✅ |
| Tabla editable en tiempo real | ✅ |
| Buscador y filtros | ✅ |
| CRUD completo | ✅ |
| Sin duplicados al reimportar | ✅ |

### ✅ Fase 3 — Graficos y Reportes `COMPLETADO`

16 graficos: Barras, Doughnut, Pie, Linea, Radar, Polar Area, Bubble, Acumulado, Top 5, Rango precios, Stock vs minimo, Doble eje.

### ✅ Fase 4 — Entradas/Salidas y Proveedores `COMPLETADO`

| Funcionalidad | Estado |
|:-------------|:------:|
| Registro movimientos | ✅ |
| Filtro por fechas | ✅ |
| Alertas stock minimo | ✅ |
| CRUD Proveedores | ✅ |

### ✅ Fase 5 — Chatbot con IA `COMPLETADO`

| Funcionalidad | Estado |
|:-------------|:------:|
| Groq API Llama 3.1 | ✅ |
| Datos reales en tiempo real | ✅ |
| Consultas por todos los campos | ✅ |
| Registro con lenguaje natural | ✅ |

### ✅ Fase 6 — Bot de WhatsApp `COMPLETADO`

| Funcionalidad | Estado |
|:-------------|:------:|
| whatsapp-web.js | ✅ |
| QR en el dashboard | ✅ |
| Comandos y preguntas libres | ✅ |
| Registro desde WhatsApp | ✅ |

---

## ⚙️ Instalacion

### Prerrequisitos

```bash
node --version   # v18 o superior
mysql --version  # v5.7 o superior
git --version
```

### Clonar e instalar

```bash
# Clonar
git clone https://github.com/EliasG0nzales/Eagle_Gamer_PERU.git
cd Eagle_Gamer_PERU

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Variables de entorno

Crear `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=dashboard_db
JWT_SECRET=eagle_gaming_secret_2024
JWT_EXPIRES=8h
PORT=4000
FRONTEND_URL=http://localhost:5173
GROQ_API_KEY=tu_groq_api_key
```

> **Obtener GROQ_API_KEY gratis:** https://console.groq.com → API Keys → Create Key

### Crear la base de datos

```bash
# En MySQL Workbench: abrir schema.sql → Ctrl+Shift+Enter
# O desde terminal:
mysql -u root -p < backend/schema.sql
```

### Levantar el proyecto

```bash
# Terminal 1
cd backend && node src/server.js

# Terminal 2
cd frontend && npm run dev
```

### Credenciales de acceso

```
URL:       http://localhost:5173
Email:     admin@empresa.com
Password:  password
```

---

## 📊 Estadisticas del Proyecto

| Metrica | Valor |
|:--------|:-----:|
| Productos en catalogo | 125 |
| Categorias | 11 |
| Graficos interactivos | 16 |
| Endpoints API | 15 |
| Tablas MySQL | 4 |
| Fases completadas | 6 de 6 |
| Lineas de codigo frontend | 750+ |
| Lineas de codigo backend | 600+ |

---

## 👥 Equipo

<div align="center">

| Integrante | Rol | Responsabilidades |
|:----------:|:----|:-----------------|
| **Elias** | Tech Lead | Arquitectura, Dashboard, Graficos, Coordinacion general |
| **Renzo** | Backend Dev | API REST, Chatbot IA, Bot WhatsApp, Base de datos |
| **Rodrigo** | Full Stack | Integracion frontend-backend, Testing, Documentacion |
| **Luna** | UI/UX Dev | Estilos CSS, Responsive mobile, Mejoras visuales |

</div>

---

## 🤝 Contribuir

```bash
git checkout -b feature/nueva-funcionalidad
git add .
git commit -m "feat: descripcion del cambio"
git push origin feature/nueva-funcionalidad
# Abrir Pull Request en GitHub
```

---

<div align="center">

![Footer](https://capsule-render.vercel.app/api?type=waving&color=6c63ff&height=120&section=footer&animation=fadeIn)

**Eagle Gaming System** — Desarrollado con ❤️ en Peru 🇵🇪

*React + Node.js + MySQL + Groq IA + WhatsApp Bot*

⭐ Si te gusto el proyecto dale una estrella en GitHub ⭐

</div>
