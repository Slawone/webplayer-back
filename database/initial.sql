// ============================================
// FILE: initial.sql
// Создание таблицы в PostgreSQL
// ============================================
/*
CREATE TABLE table_name (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  hex_code VARCHAR(7) NOT NULL CHECK (hex_code ~ '^#[0-9A-Fa-f]{6}$'),
  created_at TIMESTAMP DEFAULT NOW()
);
*/

// ============================================
// Вывести все таблицы в бд
// ============================================
/*
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
*/

// ============================================
// Вывести все поля таблицы
// ============================================
/*
SELECT * FROM table_name;
*/

/*
-- Таблица марок автомобилей
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    country VARCHAR(50)
);

-- Таблица моделей
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    UNIQUE(brand_id, name)
);

-- Таблица цветов
CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    hex_code VARCHAR(7)
);

-- Основная таблица автомобилей
CREATE TABLE cars (
    id SERIAL PRIMARY KEY,
    model_id INTEGER NOT NULL REFERENCES models(id),
    color_id INTEGER REFERENCES colors(id),
    year INTEGER NOT NULL CHECK (year >= 1886 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    vin VARCHAR(17) UNIQUE, -- идентификационный номер
    license_plate VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_cars_year ON cars(year);
CREATE INDEX idx_cars_model_id ON cars(model_id);
CREATE INDEX idx_cars_vin ON cars(vin);
*/