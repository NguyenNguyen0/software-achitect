-- Tạo bảng products
CREATE TABLE IF NOT EXISTS products (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50)
);

-- Dữ liệu mẫu
INSERT INTO products (name, category) VALUES
('Apple iPhone 15', 'Phone'),
('Apple MacBook Pro', 'Laptop'),
('Apple iPad Air', 'Tablet'),
('Samsung Galaxy S24', 'Phone'),
('Samsung Galaxy Tab', 'Tablet'),
('Dell XPS 15', 'Laptop'),
('Sony WH-1000XM5', 'Audio'),
('Sony PlayStation 5', 'Gaming'),
('Nike Air Max', 'Shoes'),
('Nike React Infinity', 'Shoes'),
('Adidas Ultraboost', 'Shoes'),
('Logitech MX Master', 'Accessory'),
('Logitech G Pro Mouse', 'Accessory');

-- Stored Procedure tìm kiếm
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS sp_search_products(IN keyword VARCHAR(100))
BEGIN
    SELECT id, name, category
    FROM products
    WHERE name LIKE CONCAT('%', keyword, '%')
       OR category LIKE CONCAT('%', keyword, '%')
    ORDER BY name
    LIMIT 10;
END$$
DELIMITER ;
