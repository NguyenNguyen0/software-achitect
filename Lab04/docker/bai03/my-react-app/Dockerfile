# Base image
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build project Vite
RUN npm run build

# Cài serve để chạy file build
RUN npm install -g serve

# Mở cổng 3000
EXPOSE 3000

# Chạy ứng dụng
CMD ["serve", "-s", "dist", "-l", "3000"]