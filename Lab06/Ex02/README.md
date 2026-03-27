
---

# 1. Horizontal Partition (phân vùng ngang)

👉 Ý tưởng: **cùng structure, chia data theo điều kiện**

---

## 🔥 Ví dụ: chia theo giới tính

### Cách 1: Manual partition (2 table riêng)

```sql
CREATE TABLE user_male (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    gender VARCHAR(10)
);

CREATE TABLE user_female (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    gender VARCHAR(10)
);
```

---

## Insert theo logic

```sql
-- Nam
INSERT INTO user_male VALUES (1, 'An', 'male');

-- Nữ
INSERT INTO user_female VALUES (2, 'Lan', 'female');
```

---

## Trong Spring Boot (pseudo code)

```java
if(user.getGender().equals("male")) {
    userMaleRepository.save(user);
} else {
    userFemaleRepository.save(user);
}
```

👉 Đây chính là cái bạn mô tả:

> condition → table_user_01 / table_user_02

---

## 🔥 Cách 2: Partition thật trong MariaDB

```sql
CREATE TABLE users (
    id INT,
    name VARCHAR(100),
    gender VARCHAR(10)
)
PARTITION BY LIST COLUMNS(gender) (
    PARTITION p_male VALUES IN ('male'),
    PARTITION p_female VALUES IN ('female')
);
```

👉 Lợi ích:

* Query nhanh hơn (scan ít data)
* Không cần split logic trong code

---

# 2. Vertical Partition (phân vùng dọc)

👉 Ý tưởng: **tách column**

---

## 🔥 Ví dụ: user table lớn

### ❌ Table ban đầu

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    address TEXT,
    avatar BLOB,
    bio TEXT
);
```

👉 vấn đề:

* Query basic vẫn phải load data nặng (BLOB, TEXT)

---

## ✅ Tách ra

```sql
-- Table nhẹ (hay dùng)
CREATE TABLE user_basic (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

-- Table nặng (ít dùng)
CREATE TABLE user_detail (
    user_id INT,
    address TEXT,
    avatar BLOB,
    bio TEXT
);
```

---

## Query

```sql
-- Lấy nhanh
SELECT * FROM user_basic;

-- Khi cần detail
SELECT * 
FROM user_basic u
JOIN user_detail d ON u.id = d.user_id;
```

---

👉 Lợi ích:

* Query nhanh hơn
* Giảm I/O
* Cache tốt hơn

---

# 3. Function Partition (logic partition)

👉 Ý tưởng: chia theo **hàm / rule**

---

## 🔥 Ví dụ: chia theo năm sinh (age)

```sql
CREATE TABLE users (
    id INT,
    name VARCHAR(100),
    birth_year INT
)
PARTITION BY RANGE (birth_year) (
    PARTITION p_old VALUES LESS THAN (1990),
    PARTITION p_mid VALUES LESS THAN (2000),
    PARTITION p_young VALUES LESS THAN MAXVALUE
);
```

---

## Ví dụ khác: theo hash (scale lớn)

```sql
CREATE TABLE users (
    id INT,
    name VARCHAR(100)
)
PARTITION BY HASH(id)
PARTITIONS 4;
```

👉 Data sẽ tự chia đều vào 4 partition

---

# 4. So sánh nhanh

| Type       | Ý tưởng        | Ví dụ          |
| ---------- | -------------- | -------------- |
| Horizontal | chia row       | male / female  |
| Vertical   | chia column    | basic / detail |
| Function   | chia theo rule | year, hash     |

---

# 5. Khi nào dùng cái nào?

### ✅ Horizontal

* Data cực lớn (triệu → tỷ record)
* Query theo filter rõ ràng (gender, region…)

---

### ✅ Vertical

* Table có column nặng (BLOB, TEXT)
* API chỉ dùng 20% column

---

### ✅ Function

* Data time-series (log, order)
* Muốn auto scale partition

--- 