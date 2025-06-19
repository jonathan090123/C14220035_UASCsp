-- ========================================
-- Supabase SQL Setup Script (PostgreSQL)
-- Membuat tabel users dan products dengan data sample
-- ========================================

-- Drop tables jika sudah ada (opsional, hapus komentar jika diperlukan)
-- DROP TABLE IF EXISTS products;
-- DROP TABLE IF EXISTS users;

-- ========================================
-- Membuat tabel users
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- Membuat tabel products
-- ========================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_produk TEXT NOT NULL,
  harga_satuan NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- Function dan Trigger untuk auto-update updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Insert data sample untuk users
-- ========================================
INSERT INTO users (username, password, role) VALUES
  ('user1', 'password123', 'user'),
  ('admin1', 'adminpassword', 'admin'),
  ('user2', 'password123', 'user'),
  ('admin2', 'adminpassword', 'admin');

-- ========================================
-- Insert data sample untuk products
-- ========================================
INSERT INTO products (nama_produk, harga_satuan, quantity) VALUES
  ('Laptop Gaming ROG Strix', 25000000, 5),
  ('Mouse Wireless Logitech MX Master 3', 1500000, 25),
  ('Keyboard Mechanical RGB Corsair', 2850000, 15),
  ('Monitor 27" 4K LG UltraGear', 6500000, 8),
  ('Webcam HD 1080p Logitech C920', 1450000, 12),
  ('Headset Gaming SteelSeries', 1750000, 18),
  ('SSD NVMe 1TB Samsung', 2200000, 30),
  ('RAM DDR4 32GB Corsair', 4500000, 20),
  ('Graphics Card RTX 4070', 12000000, 3),
  ('Motherboard ASUS ROG', 5500000, 7),
  ('Power Supply 850W Modular', 1800000, 12),
  ('Case Gaming RGB Cooler Master', 1200000, 15),
  ('CPU Cooler AIO 240mm', 2800000, 10),
  ('Speakers 2.1 Logitech Z623', 2500000, 8),
  ('Mousepad Gaming Large', 450000, 50);

-- ========================================
-- Verifikasi data yang telah diinsert
-- ========================================
-- Tampilkan semua users
SELECT 'USERS TABLE:' AS info;
SELECT id, username, role, created_at FROM users;

-- Tampilkan semua products
SELECT 'PRODUCTS TABLE:' AS info;
SELECT id, nama_produk, harga_satuan, quantity, created_at FROM products;

-- Tampilkan statistik
SELECT 'STATISTICS:' AS info;
SELECT 
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
  (SELECT COUNT(*) FROM products) AS total_products,
  (SELECT SUM(quantity) FROM products) AS total_stock,
  (SELECT SUM(harga_satuan * quantity) FROM products) AS total_inventory_value;

-- ========================================
-- Index untuk optimasi performa (opsional)
-- ========================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_nama ON products(nama_produk);
CREATE INDEX idx_products_quantity ON products(quantity);

-- ========================================
-- Selesai! Database siap digunakan
-- ========================================
