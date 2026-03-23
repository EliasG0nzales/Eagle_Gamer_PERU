const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const db     = require("../db");

const JWT_SECRET  = process.env.JWT_SECRET  || "cambia_esto_en_produccion";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "8h";

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[auth/login]", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function register(req, res) {
  const { name, email, password, role = "user" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nombre, email y contraseña son requeridos" });
  }

  try {
    const [exists] = await db.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (exists.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, hash, role]
    );

    return res.status(201).json({
      message: "Usuario creado",
      user: { id: result.insertId, name, email, role },
    });
  } catch (err) {
    console.error("[auth/register]", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function me(req, res) {
  const [rows] = await db.execute(
    "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
    [req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
  return res.json(rows[0]);
}

module.exports = { login, register, me };