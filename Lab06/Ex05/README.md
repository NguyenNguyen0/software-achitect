# 🔍 Realtime Search — Debounce Demo

## Kiến trúc

```
[React + Vite]  →(debounce 400ms)→  [Spring Boot]  →(Stored Procedure)→  [MariaDB]
```

## Setup nhanh

### 1. MariaDB
```sql
CREATE DATABASE searchdb;
USE searchdb;
-- Chạy file: backend/src/main/resources/schema.sql
```

### 2. Backend (Spring Boot)
```bash
cd backend
# Sửa application.properties: đặt username/password MariaDB
mvn spring-boot:run
# Chạy tại: http://localhost:8080
```

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Chạy tại: http://localhost:5173
```

---

## Kỹ thuật chính

### Debounce (Frontend)
```js
// hooks/useDebounce.js — chỉ 8 dòng
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)  // ← key: cancel timer cũ khi gõ tiếp
  }, [value, delay])
  return debounced
}
```
> Mỗi lần gõ → timer reset → API chỉ được gọi sau 400ms dừng gõ.
> Panel debug hiển thị số API calls thực tế so với số ký tự gõ.

### Stored Procedure (MariaDB)
```sql
CREATE PROCEDURE sp_search_products(IN keyword VARCHAR(100))
BEGIN
    SELECT id, name, category FROM products
    WHERE name LIKE CONCAT('%', keyword, '%')
       OR category LIKE CONCAT('%', keyword, '%')
    ORDER BY name LIMIT 10;
END
```

### Gọi SP từ JPA
```java
@Query(value = "CALL sp_search_products(:keyword)", nativeQuery = true)
List<Product> searchByKeyword(@Param("keyword") String keyword);
```

## Cấu trúc file
```
debounce-demo/
├── frontend/
│   ├── src/
│   │   ├── hooks/useDebounce.js   ← debounce hook
│   │   ├── App.jsx                ← UI + logic
│   │   └── App.css
│   └── package.json / vite.config.js
└── backend/
    ├── pom.xml
    └── src/main/
        ├── resources/
        │   ├── schema.sql          ← table + stored procedure
        │   └── application.properties
        └── java/com/demo/search/
            ├── model/Product.java
            ├── repository/ProductRepository.java  ← gọi SP
            ├── controller/SearchController.java
            └── SearchApplication.java
```
