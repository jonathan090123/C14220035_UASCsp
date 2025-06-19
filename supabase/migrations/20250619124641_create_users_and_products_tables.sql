/*
  # Create Users and Products Tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Auto-generated unique identifier
      - `username` (text, unique) - User's login username
      - `password` (text) - Hashed password for authentication
      - `role` (text) - User role ('user' or 'admin')
      - `created_at` (timestamp) - Account creation timestamp
    - `products`
      - `id` (uuid, primary key) - Auto-generated unique identifier
      - `nama_produk` (text) - Product name
      - `harga_satuan` (numeric) - Unit price of the product
      - `quantity` (integer) - Available quantity in stock
      - `created_at` (timestamp) - Product creation timestamp
      - `updated_at` (timestamp) - Last update timestamp

  2. Security
    - Enable RLS on both `users` and `products` tables
    - Add policies for authenticated users to read their own data
    - Add policies for admins to perform CRUD operations on products
    - Add policies for users to read products

  3. Sample Data
    - Insert sample users (both user and admin roles)
    - Insert sample products for testing
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_produk text NOT NULL,
  harga_satuan numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- RLS Policies for products table
CREATE POLICY "Everyone can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Insert sample users
INSERT INTO users (username, password, role) VALUES
  ('user1', 'password123', 'user'),
  ('admin1', 'admin123', 'admin');

-- Insert sample products
INSERT INTO products (nama_produk, harga_satuan, quantity) VALUES
  ('Laptop Gaming ROG', 25000000, 5),
  ('Mouse Wireless Logitech', 150000, 25),
  ('Keyboard Mechanical RGB', 850000, 15),
  ('Monitor 27" 4K', 4500000, 8),
  ('Webcam HD 1080p', 450000, 12),
  ('Headset Gaming', 750000, 18);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();