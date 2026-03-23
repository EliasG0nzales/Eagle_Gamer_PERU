CREATE DATABASE IF NOT EXISTS dashboard_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dashboard_db;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(200)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('admin','user') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Inventario (productos del Excel) ───────────────────────
CREATE TABLE IF NOT EXISTS excel_records (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename    VARCHAR(255) NOT NULL,
  sheet_name  VARCHAR(100),
  row_index   INT UNSIGNED NOT NULL DEFAULT 0,
  data        JSON         NOT NULL,
  uploaded_by INT UNSIGNED,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Historial de cambios ────────────────────────────────────
CREATE TABLE IF NOT EXISTS change_history (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_id    INT UNSIGNED NOT NULL,
  field_name   VARCHAR(100) NOT NULL,
  old_value    TEXT,
  new_value    TEXT,
  changed_by   INT UNSIGNED,
  changed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id)  REFERENCES excel_records(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Movimientos de stock ────────────────────────────────────
CREATE TABLE IF NOT EXISTS movimientos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fecha       VARCHAR(20),
  producto    VARCHAR(200),
  tipo        ENUM('Entrada','Salida') DEFAULT 'Entrada',
  cantidad    INT DEFAULT 0,
  costo       DECIMAL(10,2) DEFAULT 0,
  responsable VARCHAR(100),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Proveedores ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proveedores (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(150) NOT NULL,
  producto   VARCHAR(200),
  precio     VARCHAR(100),
  entrega    VARCHAR(100),
  contacto   VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Usuario administrador ───────────────────────────────────
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (
  'Administrador',
  'admin@empresa.com',
  '$2a$12$KIXIhk3xjDCbLoEZqEpKuuaI7UYoFiJjb9ZhKz8skNAuwQgUKOTiq',
  'admin'
);

-- ── Inventario completo (125 productos del Excel) ───────────
-- Limpiar datos anteriores antes de insertar
DELETE FROM excel_records WHERE filename = 'LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx';

INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Tarjeta de Vídeo', 0, '{"categoria": "TARJETA DE VIDEO ASUS", "modelo": "Radeon RX 9070 XT OC Edition", "precio_venta": 3299.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Tarjeta de Vídeo', 1, '{"categoria": "TARJETA DE VIDEO GIGABYTE", "modelo": "RTX 5070 WINDFORCE OC", "precio_venta": 2920.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Tarjeta de Vídeo', 2, '{"categoria": "TARJETA DE VIDEO BOETEC", "modelo": "RX 580", "precio_venta": 699.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Tarjeta de Vídeo', 3, '{"categoria": "TARJETA DE VIDEO GIGABYTE", "modelo": "AMD RX 7600 8GB GAMING OC 3FAN", "precio_venta": 1230.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Tarjeta de Vídeo', 4, '{"categoria": "TARJETA GRAFICA NVIDIA", "modelo": "GeForce RTX 4060 8GB", "precio_venta": 1399.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Case', 5, '{"categoria": "CASE ANTRYX", "modelo": "FX 650 ARGB", "precio_venta": 280.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Case', 6, '{"categoria": "CASE DATAONE", "modelo": "Star 508", "precio_venta": 120.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Case', 7, '{"categoria": "CASE GAMER", "modelo": "Dragon CR15 Black", "precio_venta": 199.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Case', 8, '{"categoria": "CASE GAMER", "modelo": "Dragon CR15 White", "precio_venta": 199.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Case', 9, '{"categoria": "CASE GAMER", "modelo": "TORNADO 04", "precio_venta": 200.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Case', 10, '{"categoria": "CASE GAMER HALION", "modelo": "Tornado Blanco", "precio_venta": 220.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Case', 11, '{"categoria": "CASE GAMER GAMEMAX", "modelo": "Contac COC Turbo Rojo/Negro", "precio_venta": 179.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Case', 12, '{"categoria": "CASE MICRONICS", "modelo": "iCUBE MIC GC800‑6", "precio_venta": 189.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Case', 13, '{"categoria": "Case TEROS", "modelo": "TE-1035S", "precio_venta": 90.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Case', 14, '{"categoria": "Case TEROS", "modelo": "TE-1033S", "precio_venta": 90.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 15, '{"categoria": "PLACA MADRE GIGABYTE", "modelo": "B560 AORUS PRO AX", "precio_venta": 790.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 16, '{"categoria": "PLACA MADRE GIGABYTE", "modelo": "B660 GAMING X AX DDR4", "precio_venta": 929.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 17, '{"categoria": "PLACA MADRE GIGABYTE", "modelo": "Z690 UD AX DDR4 (Renewed)", "precio_venta": 1015.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 18, '{"categoria": "PLACA MADRE GIGABYTE", "modelo": "Z790 Gaming X AX", "precio_venta": 1080.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 19, '{"categoria": "PLACA MADRE GIGABYTE", "modelo": "Z790 UD AC", "precio_venta": 999.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 20, '{"categoria": "PLACA MADRE ASUS", "modelo": "Prime B760M‑A D4", "precio_venta": 419.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 21, '{"categoria": "PLACA MADRE ASUS", "modelo": "TUF Gaming B550‑Plus Wi‑Fi II", "precio_venta": 640.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 22, '{"categoria": "PLACA MADRE MSI", "modelo": "A520M‑A PRO", "precio_venta": 220.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 23, '{"categoria": "PLACA MADRE MSI", "modelo": "B550M PRO‑VDH Wi‑Fi", "precio_venta": 380.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 24, '{"categoria": "PLACA MADRE MSI", "modelo": "MAG Z890 Tomahawk Wi‑Fi", "precio_venta": 1369.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 25, '{"categoria": "PLACA MADRE MSI", "modelo": "PRO B760M‑P DDR4", "precio_venta": 399.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 26, '{"categoria": "PLACA MADRE MSI", "modelo": "PRO H510M‑A", "precio_venta": 250.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 27, '{"categoria": "PLACA MADRE MSI", "modelo": "PRO Z790‑P Wi‑Fi DDR4", "precio_venta": 970.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 28, '{"categoria": "PLACA MADRE MSI", "modelo": "Z690 Tomahawk Wi‑Fi DDR4", "precio_venta": 1190.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 29, '{"categoria": "PLACA MADRE ASRock", "modelo": "Z790 PG‑Sonic DDR5", "precio_venta": 1099.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 30, '{"categoria": "PLACA MADRE ASUS", "modelo": "Prime B760‑Plus", "precio_venta": 640.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 31, '{"categoria": "PLACA MADRE ASUS", "modelo": "Prime H510M‑E", "precio_venta": 260.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 32, '{"categoria": "PLACA MADRE GIGABYTE", "modelo": "B760M Aorus Elite AX", "precio_venta": 730.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 33, '{"categoria": "PLACA MADRE GIGABYTE", "modelo": "B760 Aorus Elite AX", "precio_venta": 879.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 34, '{"categoria": "PLACA MADRE GIGABYTE", "modelo": "B760 Gaming X AX DDR5", "precio_venta": 870.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 35, '{"categoria": "PLACA MADRE GIGABYTE", "modelo": "H610M H DDR4 LGA 1700 (H610M H DDR4 G10)", "precio_venta": 319.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 36, '{"categoria": "PLACA MADRE GIGABYTE", "modelo": "X870 EAGLE WIFI7 (AMD X870, AM5, ATX)", "precio_venta": 1054.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 37, '{"categoria": "PLACA MADRE MSI", "modelo": "Z590-A PRO ATX LGA1200 DDR4", "precio_venta": 779.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 38, '{"categoria": "PLACA MADRE MSI", "modelo": "MAG B550 TOMAHAWK (AMD Ryzen, DDR4, AM4)", "precio_venta": 840.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Placa Madre', 39, '{"categoria": "PLACA MADRE MSI", "modelo": "PRO H610M-G D4 LGA 1700 mATX", "precio_venta": 300.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Laptops', 40, '{"categoria": "Laptop Lenovo", "modelo": "LOQ 15IAX9 (83GS00EQLM)", "precio_venta": 2899.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Laptops', 41, '{"categoria": "Laptop Lenovo", "modelo": "LOQ 15IAX9 (83GS006WLM)", "precio_venta": 2699.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Laptops', 42, '{"categoria": "Laptop Lenovo", "modelo": "V15 G4 IRU", "precio_venta": 1849.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Estabilizador', 43, '{"categoria": "ESTABILIZADOR FORZA", "modelo": "FVR-1012", "precio_venta": 50.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Estabilizador', 44, '{"categoria": "ESTABILIZADOR FORZA", "modelo": "FVR-1222USB", "precio_venta": 80.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Estabilizador', 45, '{"categoria": "ESTABILIZADOR FORZA", "modelo": "FVR‑902", "precio_venta": 45.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Disco SSD', 46, '{"categoria": "SSD KINGSTON", "modelo": "NV3 1TB", "precio_venta": 495.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Disco SSD', 47, '{"categoria": "SSD KINGSTON FURY RENEGADE", "modelo": "Renegade 2TB", "precio_venta": 900.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Disco SSD', 48, '{"categoria": "SSD KINGSTON", "modelo": "KC3000", "precio_venta": 379.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Disco SSD', 49, '{"categoria": "SSD PATRIOT", "modelo": "P300", "precio_venta": 110.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Fuente de poder', 50, '{"categoria": "FUENTE ASUS ROG STRIX", "modelo": "ROG‑STRIX‑550G", "precio_venta": 390.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Fuente de poder', 51, '{"categoria": "FUENTE Halion Gaming", "modelo": "GE‑650W", "precio_venta": 140.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Fuente de poder', 52, '{"categoria": "FUENTE XPG Pylon", "modelo": "750 BRONZE", "precio_venta": 260.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Fuente de poder', 53, '{"categoria": "FUENTE GIGABYTE", "modelo": "GP‑P650SS ICE", "precio_venta": 218.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Fuente de poder', 54, '{"categoria": "FUENTE GIGABYTE", "modelo": "GP‑P550B", "precio_venta": 200.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Fuente de poder', 55, '{"categoria": "FUENTE GIGABYTE", "modelo": "GP‑P650G", "precio_venta": 260.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Fuente de poder', 56, '{"categoria": "FUENTE GIGABYTE", "modelo": "GP-UD1000GM", "precio_venta": 720.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Fuente de poder', 57, '{"categoria": "FUENTE GIGABYTE", "modelo": "GP-UD750GM", "precio_venta": 379.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'RAM', 58, '{"categoria": "Memoria CORSAIR  VENGEANCE", "modelo": "DDR4 16GB  2X8GB", "precio_venta": 1000.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'RAM', 59, '{"categoria": "Memoria CORSAIR VENGEANCE", "modelo": "DDR4 16GB 2X8GB", "precio_venta": 1000.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'RAM', 60, '{"categoria": "Memoria CORSAIR VENGEANCE", "modelo": "DDR4 16GB 2X8GB", "precio_venta": 1000.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'RAM', 61, '{"categoria": "Memoria CORSAIR VENGEANCE", "modelo": "DDR4 8GB", "precio_venta": 1000.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'RAM', 62, '{"categoria": "Memoria DELTA", "modelo": "DDR4 8GB", "precio_venta": 1000.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'RAM', 63, '{"categoria": "Memoria HIKSEMI ARMOR", "modelo": "DDR4 8GB", "precio_venta": 1000.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'RAM', 64, '{"categoria": "Memoria HIKSEMI ARMOR", "modelo": "DDR4 16gb", "precio_venta": 1000.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'RAM', 65, '{"categoria": "Memoria HIKSEMI FUTURE", "modelo": "DDR5 16GB", "precio_venta": 1000.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'RAM', 66, '{"categoria": "Memoria KINGSTON FURY", "modelo": "DDR4 8GB", "precio_venta": 1000.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'RAM', 67, '{"categoria": "Memoria KINGSTON FURY", "modelo": "DDR5 8GB", "precio_venta": 1000.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'RAM', 68, '{"categoria": "Memoria TEAM T-FORCE XTREEM ARGB", "modelo": "DDR5 32GB 2X16GB", "precio_venta": 3000.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 69, '{"categoria": "PROCESADOR AMD RYZEN", "modelo": "5 5500", "precio_venta": 359.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 70, '{"categoria": "PROCESADOR AMD RYZEN", "modelo": "5 5600GT", "precio_venta": 569.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 71, '{"categoria": "PROCESADOR AMD RYZEN", "modelo": "5 7600X", "precio_venta": 890.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 72, '{"categoria": "PROCESADOR AMD RYZEN", "modelo": "5 8600G", "precio_venta": 760.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 73, '{"categoria": "PROCESADOR AMD RYZEN", "modelo": "5 5500", "precio_venta": 353.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 74, '{"categoria": "PROCESADOR AMD RYZEN", "modelo": "5 5600G", "precio_venta": 579.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 75, '{"categoria": "PROCESADOR INTEL CORE", "modelo": "I3‑10100T", "precio_venta": 400.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 76, '{"categoria": "PROCESADOR INTEL CORE", "modelo": "I3‑10100T", "precio_venta": 270.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 77, '{"categoria": "PROCESADOR INTEL CORE", "modelo": "I3-12100", "precio_venta": 500.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 78, '{"categoria": "PROCESADOR INTEL CORE", "modelo": "I3-12100F", "precio_venta": 350.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 79, '{"categoria": "PROCESADOR INTEL CORE", "modelo": "I3-13100", "precio_venta": 540.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 80, '{"categoria": "PROCESADOR INTEL CORE", "modelo": "I5 12400F", "precio_venta": 500.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 81, '{"categoria": "PROCESADOR INTEL CORE", "modelo": "I5 14600KF", "precio_venta": 990.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 82, '{"categoria": "PROCESADOR INTEL CORE", "modelo": "I5-10400F", "precio_venta": 450.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 83, '{"categoria": "PROCESADOR INTEL CORE", "modelo": "I5-10500T OEM", "precio_venta": 449.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 84, '{"categoria": "PROCESADOR INTEL CORE", "modelo": "I7 13700F", "precio_venta": 1250.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 85, '{"categoria": "PROCESADOR INTEL CORE", "modelo": "I7-10700 OEM", "precio_venta": 850.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 86, '{"categoria": "PROCESADOR INTEL CORE", "modelo": "I7-13700", "precio_venta": 1480.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 87, '{"categoria": "PROCESADOR RYZEN", "modelo": "5 8500G", "precio_venta": 545.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 88, '{"categoria": "PROCESADOR RYZEN", "modelo": "7 5700G", "precio_venta": 699.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Procesadores', 89, '{"categoria": "PROCESADOR RYZEN", "modelo": "7 5800XT", "precio_venta": 999.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 90, '{"categoria": "Monitor ASUS", "modelo": "XG27AQDMG", "precio_venta": 2899.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 91, '{"categoria": "Monitor Asus", "modelo": "XG27ACG", "precio_venta": 1559.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 92, '{"categoria": "Monitor ASUS TUF GAMING", "modelo": "VG27AQ3A", "precio_venta": 879.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 93, '{"categoria": "Monitor GAMER TEROS (Curvo)", "modelo": "TE-2767G", "precio_venta": 659.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 94, '{"categoria": "Monitor Gamer UltraGear", "modelo": "27GS65F-B", "precio_venta": 749.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 95, '{"categoria": "Monitor Gamer UltraGear", "modelo": "24GS65F-B", "precio_venta": 560.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 96, '{"categoria": "Monitor GAMING MSI", "modelo": "MAG 276CXF", "precio_venta": 539.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 97, '{"categoria": "Monitor GAMING MSI (Curvo)", "modelo": "MAG 32C6X", "precio_venta": 899.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 98, '{"categoria": "Monitor GAMING TEROS(Curvo)", "modelo": "TE‑3412G", "precio_venta": 949.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 99, '{"categoria": "Monitor LED LG", "modelo": "27GR93U", "precio_venta": 1999.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 100, '{"categoria": "Monitor TEROS", "modelo": "TE‑2128S", "precio_venta": 219.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 101, '{"categoria": "Monitor TEROS", "modelo": "TE-2415S", "precio_venta": 249.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 102, '{"categoria": "Monitor TEROS", "modelo": "TE-2130CS", "precio_venta": 200.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 103, '{"categoria": "Monitor TEROS (Curvo)", "modelo": "TE-3215G", "precio_venta": 639.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 104, '{"categoria": "Monitor TEROS(Curvo)", "modelo": "TE-2732S", "precio_venta": 379.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 105, '{"categoria": "Monitor TEROS(Plano)", "modelo": "TE-2417S", "precio_venta": 280.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 106, '{"categoria": "Monitor XIAOMI", "modelo": "A27i", "precio_venta": 339.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 107, '{"categoria": "Monitor XIAOMI", "modelo": "G24i", "precio_venta": 400.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 108, '{"categoria": "Monitor XIAOMI", "modelo": "G27i", "precio_venta": 469.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 109, '{"categoria": "Monitor XIAOMI 2K", "modelo": "A27Qi", "precio_venta": 570.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Monitores', 110, '{"categoria": "Monitor XIAOMI 2K GAMING", "modelo": "G27QI", "precio_venta": 659.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 111, '{"categoria": "AUDIFONO C/ MICROFONO ANTRYX", "modelo": "ENIGMA SE BLACK 7.1", "precio_venta": 140.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 112, '{"categoria": "AUDIFONO C/ MICROFONO ANTRYX", "modelo": "ENIGMA SE WHITE 7.1", "precio_venta": 140.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 113, '{"categoria": "AUDIFONO GAMER LOGITECH", "modelo": "G335", "precio_venta": 215.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 114, '{"categoria": "AUDÍFONOS BLUETOOTH REALME BUDS", "modelo": "BUDS Q2", "precio_venta": 80.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 115, '{"categoria": "AUDIFONOS LOGITECH", "modelo": "G435 LIGHTSPEED AZUL", "precio_venta": 254.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 116, '{"categoria": "COMBO TECLADO Y MOUSE LOGITECH", "modelo": "MK120", "precio_venta": 50.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 117, '{"categoria": "KIT ANTRYX GC-3100 X3", "modelo": "GC-3100 X3 BLACK", "precio_venta": 219.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 118, '{"categoria": "COMBO HALION 6D ALASKA", "modelo": "6D Alaska HA‑920P", "precio_venta": 39.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 119, '{"categoria": "MOUSE GAMER LOGITECH", "modelo": "G305 LIGHTSPEED WHITE", "precio_venta": 145.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 120, '{"categoria": "MOUSE GAMING LOGITECH", "modelo": "G203 LIGHTSYNC RGB WHITE", "precio_venta": 99.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 121, '{"categoria": "MOUSE GAMING LOGITECH", "modelo": "G203 LIGHTSYNC RGB BLUE", "precio_venta": 99.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 122, '{"categoria": "MOUSE GAMING LOGITECH", "modelo": "G203 LIGHTSYNC RGB PURPLE", "precio_venta": 99.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 123, '{"categoria": "MOUSE GAMING LOGITECH", "modelo": "G203 LIGHTSYNC RGB BLACK", "precio_venta": 99.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);
INSERT INTO excel_records (filename, sheet_name, row_index, data, uploaded_by) VALUES ('LIBRO_DE_INVENTARIO_EAGLE_GAMING.xlsx', 'Perifericos', 124, '{"categoria": "CÁMARA WEB TEROS", "modelo": "TE‑9072 2K Webcam con obturador", "precio_venta": 60.0, "precio_min": 0, "precio_compra": 0, "cantidad": 0}', 1);

-- ── Verificar insercion ────────────────────────────────────
SELECT sheet_name, COUNT(*) as total FROM excel_records GROUP BY sheet_name ORDER BY sheet_name;
SELECT COUNT(*) as total_productos FROM excel_records;