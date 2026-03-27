# 🍜 FoodDash — Online Food Delivery System

Hệ thống đặt đồ ăn trực tuyến xây dựng theo kiến trúc **Monolith** với lộ trình rõ ràng để migrate sang **Microservices**.

---

## 🚀 Khởi chạy nhanh

```bash
# Clone và khởi động toàn bộ hệ thống
docker-compose up --build

# Truy cập
# Frontend:  http://localhost:3000
# Backend:   http://localhost:5000
# API Docs:  http://localhost:5000/api/health
```

---

## 📁 Cấu trúc dự án

```
food-delivery/
├── docker-compose.yml          # Orchestration
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js           # Entry point
│       ├── config/
│       │   ├── database.js     # PostgreSQL pool
│       │   └── init.sql        # Schema + seed data
│       ├── middleware/
│       │   └── auth.js         # JWT middleware
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── restaurantController.js
│       │   └── orderController.js
│       └── routes/
│           ├── auth.js
│           ├── restaurants.js
│           └── orders.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   ├── AuthContext.jsx  # JWT auth state
        │   └── CartContext.jsx  # Shopping cart state
        ├── services/
        │   └── api.js          # Axios instance
        ├── components/
        │   └── Navbar.jsx
        └── pages/
            ├── Home.jsx        # Restaurant listing
            ├── Restaurant.jsx  # Menu + add to cart
            ├── Cart.jsx        # Checkout
            ├── Orders.jsx      # Order history + detail
            └── Auth.jsx        # Login / Register
```

---

## 🏗️ Kiến trúc hệ thống

### Monolith hiện tại

```
[React SPA] → [Nginx] → [Express Monolith] → [PostgreSQL]
```

Toàn bộ business logic nằm trong một Express app duy nhất:
- Authentication (JWT)
- Restaurant & Menu management  
- Order management (transaction-safe)

### Tech Stack

| Layer      | Technology          |
|------------|---------------------|
| Frontend   | React 18 + Vite + JS |
| Backend    | Node.js + Express   |
| Database   | PostgreSQL 16       |
| Auth       | JWT (jsonwebtoken)  |
| Container  | Docker + Docker Compose |
| Web Server | Nginx (SPA + proxy) |

---

## 📐 Thiết kế Monolith → Microservices Migration

### Bounded Contexts (DDD)

Hệ thống được phân chia thành **4 Bounded Contexts** chính:

#### 1. 👤 User Context
- **Entities**: User, Session
- **Responsibilities**: Đăng ký, đăng nhập, quản lý profile
- **Future service**: `user-service` (port 3001)

#### 2. 🍽 Restaurant Context  
- **Entities**: Restaurant, Category, MenuItem
- **Responsibilities**: CRUD nhà hàng, thực đơn, giờ mở cửa
- **Future service**: `restaurant-service` (port 3002)

#### 3. 📦 Order Context
- **Entities**: Order, OrderItem
- **Responsibilities**: Đặt hàng, thanh toán, trạng thái đơn
- **Future service**: `order-service` (port 3003)

#### 4. 🚚 Delivery Context (future)
- **Entities**: Delivery, Driver, Route
- **Responsibilities**: Phân công tài xế, tracking
- **Future service**: `delivery-service` (port 3004)

---

## 🔄 Giao tiếp Sync vs Async

### Synchronous (REST/HTTP)
Dùng khi cần **response ngay lập tức**:

```
Client → API Gateway → User Service      (login, get profile)
Client → API Gateway → Restaurant Service (browse, menu)
Client → API Gateway → Order Service     (create order - cần validate ngay)
```

### Asynchronous (Event-driven: Kafka/RabbitMQ)
Dùng khi **không cần kết quả ngay** hoặc **fan-out events**:

```
Order Service  --[order.created]-→  Notification Service
Order Service  --[order.created]-→  Restaurant Service (confirm)
Order Service  --[order.paid]----→  Payment Service
Order Service  --[order.ready]---→  Delivery Service
Delivery Svc   --[order.delivered]→ Order Service (update status)
```

---

## 📨 Event Messaging Design

### Kafka Topics

| Topic | Producer | Consumers | Payload |
|-------|----------|-----------|---------|
| `order.created` | Order Service | Restaurant, Notification | orderId, userId, items |
| `order.confirmed` | Restaurant | Order, Notification | orderId, estimatedTime |
| `order.preparing` | Restaurant | Notification | orderId |
| `order.ready` | Restaurant | Delivery, Notification | orderId, location |
| `order.picked_up` | Delivery | Order, Notification | orderId, driverId |
| `order.delivered` | Delivery | Order, Notification | orderId, timestamp |
| `payment.processed` | Payment | Order, Notification | orderId, amount |

### Event Schema (ví dụ: order.created)

```json
{
  "eventId": "uuid-v4",
  "eventType": "order.created",
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "order-service",
  "data": {
    "orderId": "ord-123",
    "userId": "usr-456",
    "restaurantId": "res-789",
    "items": [
      { "menuItemId": "item-001", "name": "Phở bò", "qty": 2, "price": 65000 }
    ],
    "totalAmount": 155000,
    "deliveryAddress": "123 Lê Lợi, Q.1, TP.HCM"
  }
}
```

### RabbitMQ Alternative

```
Exchange: food.delivery (type: topic)
├── Routing key: order.*     → Queue: order-events
├── Routing key: payment.*   → Queue: payment-events  
├── Routing key: delivery.*  → Queue: delivery-events
└── Routing key: *.notify    → Queue: notification-events
```

---

## 🗄️ Database Schema

```sql
users          -- Tài khoản người dùng
restaurants    -- Nhà hàng
categories     -- Danh mục món ăn (thuộc nhà hàng)
menu_items     -- Món ăn (thuộc category)
orders         -- Đơn hàng (FK: user, restaurant)
order_items    -- Chi tiết đơn hàng (FK: order, menu_item)
```

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register    -- Đăng ký
POST /api/auth/login       -- Đăng nhập  
GET  /api/auth/profile     -- Thông tin cá nhân (auth)
```

### Restaurants
```
GET  /api/restaurants              -- Danh sách (filter: cuisine, search)
GET  /api/restaurants/:id          -- Chi tiết + menu
```

### Orders
```
POST  /api/orders                  -- Tạo đơn hàng (auth)
GET   /api/orders                  -- Lịch sử đơn (auth)
GET   /api/orders/:id              -- Chi tiết đơn (auth)
PATCH /api/orders/:id/status       -- Cập nhật trạng thái (auth)
```

---

## 🛣️ Migration Roadmap

### Phase 1 — Strangler Fig Pattern
Tách User Service ra trước (ít coupling nhất):
```
Monolith → [API Gateway] → User Service (new)
                        → Monolith (rest)
```

### Phase 2 — Extract Restaurant Service
```
[API Gateway] → User Service
             → Restaurant Service (new)
             → Monolith (orders only)
```

### Phase 3 — Extract Order Service + Events
```
[API Gateway] → User Service
             → Restaurant Service
             → Order Service (new) → [Kafka] → Notification
                                             → Delivery
```

### Phase 4 — Full Microservices
```
[API Gateway]
├── User Service
├── Restaurant Service  
├── Order Service
├── Payment Service
├── Delivery Service
└── Notification Service
         ↕ [Kafka Event Bus]
         ↕ [Redis Cache]
```

---

## 🧪 Test thủ công

```bash
# 1. Đăng ký tài khoản
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"123456"}'

# 2. Lấy danh sách nhà hàng
curl http://localhost:5000/api/restaurants

# 3. Tạo đơn hàng (cần token)
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"restaurant_id":"<id>","delivery_address":"123 Test St","items":[{"menu_item_id":"<id>","quantity":1}]}'
```
