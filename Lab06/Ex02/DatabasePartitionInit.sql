CREATE TABLE users_gender (
    id INT,
    name VARCHAR(100),
    gender VARCHAR(10),
    birth_year INT,
    PRIMARY KEY (id, gender)
)
PARTITION BY LIST COLUMNS(gender) (
    PARTITION p_male VALUES IN ('male'),
    PARTITION p_female VALUES IN ('female')
);

CREATE TABLE users_year (
    id INT,
    name VARCHAR(100),
    gender VARCHAR(10),
    birth_year INT,
    PRIMARY KEY (id, birth_year)
)

PARTITION BY RANGE (birth_year) (
    PARTITION p_old VALUES LESS THAN (1990),
    PARTITION p_mid VALUES LESS THAN (2000),
    PARTITION p_young VALUES LESS THAN MAXVALUE
);