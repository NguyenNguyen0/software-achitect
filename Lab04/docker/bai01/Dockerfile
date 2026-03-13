# Base image
FROM node:18

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy package.json
COPY package.json .

# Cài dependencies (nếu có)
RUN npm install

# Copy toàn bộ source code
COPY . .

# Mở cổng 3000
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "start"]