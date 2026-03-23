const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "cambia_esto_en_produccion";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado, vuelve a iniciar sesión" });
    }
    return res.status(401).json({ message: "Token inválido" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Acceso restringido a administradores" });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };