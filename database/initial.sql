// ============================================
// FILE: initial.sql
// Создание таблицы в PostgreSQL
// ============================================
/*
CREATE TABLE colors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  hex_code VARCHAR(7) NOT NULL CHECK (hex_code ~ '^#[0-9A-Fa-f]{6}$'),
  created_at TIMESTAMP DEFAULT NOW()
);
*/

// ============================================
// FILE: initial.sql
// Вывести все таблицы в бд
// ============================================
/*
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
*/

// ============================================
// FILE: initial.sql
// Вывести все поля таблицы
// ============================================
/*
SELECT * FROM table_name;
*/