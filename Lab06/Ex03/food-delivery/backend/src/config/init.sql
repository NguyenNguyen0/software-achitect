-- Food Delivery Monolith Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  image_url TEXT,
  cuisine_type VARCHAR(50),
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_open BOOLEAN DEFAULT true,
  delivery_time INTEGER DEFAULT 30,
  min_order DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Menu categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (
    status IN ('pending','confirmed','preparing','ready','delivering','delivered','cancelled')
  ),
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL
);

-- Seed data
INSERT INTO restaurants (name, description, address, phone, cuisine_type, rating, delivery_time, min_order, image_url) VALUES
('Phở Hà Nội', 'Phở truyền thống Hà Nội, nước dùng ninh 12 tiếng', '123 Lê Lợi, Q.1, TP.HCM', '028-1234-5678', 'Vietnamese', 4.8, 25, 50000, 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400'),
('Pizza Garden', 'Pizza Ý chính thống, lò đá nướng thủ công', '456 Nguyễn Huệ, Q.1, TP.HCM', '028-8765-4321', 'Italian', 4.5, 35, 100000, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'),
('Sushi Sakura', 'Nhật Bản authentic, nguyên liệu nhập khẩu', '789 Võ Văn Tần, Q.3, TP.HCM', '028-9999-1111', 'Japanese', 4.9, 40, 150000, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400'),
('Bún Bò Huế Cô Liên', 'Bún bò Huế cay nồng đặc trưng miền Trung', '321 Đinh Tiên Hoàng, Bình Thạnh', '028-3456-7890', 'Vietnamese', 4.7, 20, 40000, 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400')
ON CONFLICT DO NOTHING;

-- Phở Hà Nội menu
INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'Phở', 1 FROM restaurants WHERE name = 'Phở Hà Nội' LIMIT 1;

INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'Đồ uống', 2 FROM restaurants WHERE name = 'Phở Hà Nội' LIMIT 1;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url)
SELECT r.id, c.id, 'Phở bò tái', 'Phở bò thịt tái hồng, hành lá, ngò', 65000,
  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=300'
FROM restaurants r JOIN categories c ON c.restaurant_id = r.id
WHERE r.name = 'Phở Hà Nội' AND c.name = 'Phở' LIMIT 1;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url)
SELECT r.id, c.id, 'Phở bò chín', 'Phở bò thịt chín mềm, gân giòn', 70000,
  'https://images.unsplash.com/photo-1582878826629-33b7b3e0de2a?w=300'
FROM restaurants r JOIN categories c ON c.restaurant_id = r.id
WHERE r.name = 'Phở Hà Nội' AND c.name = 'Phở' LIMIT 1;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url)
SELECT r.id, c.id, 'Phở bò đặc biệt', 'Phở combo: tái, chín, gân, gầu', 90000,
  'https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?w=300'
FROM restaurants r JOIN categories c ON c.restaurant_id = r.id
WHERE r.name = 'Phở Hà Nội' AND c.name = 'Phở' LIMIT 1;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url)
SELECT r.id, c.id, 'Trà đá', 'Trà mạn thanh mát', 15000, null
FROM restaurants r JOIN categories c ON c.restaurant_id = r.id
WHERE r.name = 'Phở Hà Nội' AND c.name = 'Đồ uống' LIMIT 1;

-- Pizza menu
INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'Pizza', 1 FROM restaurants WHERE name = 'Pizza Garden' LIMIT 1;

INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'Pasta', 2 FROM restaurants WHERE name = 'Pizza Garden' LIMIT 1;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url)
SELECT r.id, c.id, 'Margherita', 'Cà chua San Marzano, mozzarella tươi, húng quế', 165000,
  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300'
FROM restaurants r JOIN categories c ON c.restaurant_id = r.id
WHERE r.name = 'Pizza Garden' AND c.name = 'Pizza' LIMIT 1;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url)
SELECT r.id, c.id, 'Pepperoni', 'Pepperoni Mỹ, phô mai Parmesan', 195000,
  'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300'
FROM restaurants r JOIN categories c ON c.restaurant_id = r.id
WHERE r.name = 'Pizza Garden' AND c.name = 'Pizza' LIMIT 1;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url)
SELECT r.id, c.id, 'Carbonara', 'Pasta kem trứng, bacon, phô mai Pecorino', 145000,
  'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300'
FROM restaurants r JOIN categories c ON c.restaurant_id = r.id
WHERE r.name = 'Pizza Garden' AND c.name = 'Pasta' LIMIT 1;

-- Sushi menu
INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'Sushi & Sashimi', 1 FROM restaurants WHERE name = 'Sushi Sakura' LIMIT 1;

INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'Roll', 2 FROM restaurants WHERE name = 'Sushi Sakura' LIMIT 1;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url)
SELECT r.id, c.id, 'Sashimi Cá Hồi (8 miếng)', 'Cá hồi Na Uy tươi, wasabi, gari', 250000,
  'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=300'
FROM restaurants r JOIN categories c ON c.restaurant_id = r.id
WHERE r.name = 'Sushi Sakura' AND c.name = 'Sushi & Sashimi' LIMIT 1;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url)
SELECT r.id, c.id, 'Dragon Roll', 'Tôm tempura, bơ, cá hồi, sốt eel', 185000,
  'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=300'
FROM restaurants r JOIN categories c ON c.restaurant_id = r.id
WHERE r.name = 'Sushi Sakura' AND c.name = 'Roll' LIMIT 1;

-- Bún Bò menu
INSERT INTO categories (restaurant_id, name, sort_order)
SELECT id, 'Bún Bò', 1 FROM restaurants WHERE name = 'Bún Bò Huế Cô Liên' LIMIT 1;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url)
SELECT r.id, c.id, 'Bún Bò Huế', 'Bún bò cay nồng, giò heo, chả cua', 55000,
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=300'
FROM restaurants r JOIN categories c ON c.restaurant_id = r.id
WHERE r.name = 'Bún Bò Huế Cô Liên' AND c.name = 'Bún Bò' LIMIT 1;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url)
SELECT r.id, c.id, 'Bún Bò Đặc Biệt', 'Thêm giò heo, chả, huyết', 75000,
  'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300'
FROM restaurants r JOIN categories c ON c.restaurant_id = r.id
WHERE r.name = 'Bún Bò Huế Cô Liên' AND c.name = 'Bún Bò' LIMIT 1;
