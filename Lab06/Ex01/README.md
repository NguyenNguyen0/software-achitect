# **optimize Docker image + save data với Postgres**.
---

# 1. Tối ưu Docker Image (Image Optimization)

## ❌ Vấn đề thường gặp

* Image quá lớn (vài GB)
* Build chậm
* Có nhiều layer không cần thiết
* Chứa tool chỉ dùng lúc build (compiler, npm, pip…)

---

## ✅ Cách tối ưu chính

### 1. Multi-stage build (quan trọng nhất)

Thay vì 1 stage → dùng nhiều stage để **chỉ giữ lại thứ cần thiết khi run**

---

## 🔥 Ví dụ: Node.js app

### ❌ Dockerfile chưa optimize

```dockerfile
FROM node:18

WORKDIR /app

COPY . .

RUN npm install

CMD ["node", "app.js"]
```

👉 Vấn đề:

* Copy toàn bộ source (có thể chứa `.git`, test, docs…)
* Giữ luôn node_modules dev
* Image to

---

### ✅ Dockerfile tối ưu (multi-stage)

```dockerfile
# Stage 1: build
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Stage 2: production
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app /app

RUN npm prune --production

CMD ["node", "app.js"]
```

👉 Lợi ích:

* Dùng image nhẹ (`alpine`)
* Loại bỏ dev dependencies
* Giảm size rất nhiều

---

## 🔥 Tối ưu hơn nữa (best practice)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

CMD ["node", "app.js"]
```

---

## 📦 Thêm `.dockerignore`

```txt
node_modules
.git
Dockerfile
*.log
tests
```

👉 Giảm size build context cực nhiều

---

# 2. Giảm số layer (4 → 2 → 1)

## ❌ Nhiều layer

```dockerfile
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean
```

---

## ✅ Gộp lại

```dockerfile
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

👉 giảm layer + giảm size

---

# 3. Postgres + Save Data (ý bạn hỏi phần này)

* container restart → mất data nếu không mount volume
* image không phải nơi để lưu data runtime

---

## ✅ Cách đúng: dùng Volume

```bash
docker run -d \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=123456 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:15
```

👉 `pgdata` sẽ:

* giữ data khi container chết
* tái sử dụng

---

## ✅ Init data chuẩn

```dockerfile
FROM postgres:15

COPY init.sql /docker-entrypoint-initdb.d/
```

👉 Chạy lần đầu:

* Postgres auto chạy `init.sql`

👉 Sau đó:

* data nằm trong volume, không nằm trong image

---

# 4. Tổng kết (rất quan trọng)

## 🔥 Image optimization

* Dùng `alpine` image
* Multi-stage build
* `.dockerignore`
* Gộp RUN command
* Xóa cache (`rm -rf /var/lib/apt/lists/*`)

---

## 🔥 Data trong Docker

| Cách                | Kết quả           |
| ------------------- | ----------------- |
| Lưu trong image     | ❌ sai             |
| Lưu trong container | ❌ mất khi restart |
| Volume              | ✅ đúng            |

---
