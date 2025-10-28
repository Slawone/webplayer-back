// @ts-ignore
import pg from 'pg';

/**
 * @typedef {import('./types/car').CreateCarOpts} CreateCarOpts
 * @typedef {import('./types/car').UpdateCarOpts} UpdateCarOpts
 * @typedef {import('./types/car').CarData} CarData
 * @typedef {import('./types/car').CreateModelOpts} CreateModelOpts
 * @typedef {import('./types/car').ModelData} ModelData
 * @typedef {import('./types/car').CreateBrandOpts} CreateBrandOpts
 * @typedef {import('./types/car').BrandData} BrandData
 * @typedef {import('./types/car').CreateCarColorOpts} CreateCarColorOpts
 * @typedef {import('./types/car').CarColorData} CarColorData
 */

// Деструктуризация - достаём класс Pool из библиотеки pg
const { Pool } = pg;

// Создаём пул соединений с базой данных
const pool = new Pool({
  host: 'localhost', // адрес сервера БД
  port: 5432, // порт PostgreSQL по умолчанию
  database: 'cars_db', // имя базы данных
  user: 'postgres', // имя пользователя
  password: 'password', // пароль (В ПРОДАКШЕНЕ ИСПОЛЬЗОВАТЬ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ!)
});

// ============================================
// CARS - функции для работы с автомобилями
// ============================================

/**
 * Получает все автомобили из базы данных с JOIN-ом связанных таблиц
 * @function getAllCars
 * @returns {Promise<CarData[]>} массив всех автомобилей с данными модели, бренда и цвета
 */
export const getAllCars = async () => {
  // SELECT с JOIN для получения связанных данных из трех таблиц
  // JOIN объединяет таблицы по внешним ключам
  const result = await pool.query(`
    SELECT
      cars.id,
      cars.model_id,
      cars.color_id,
      cars.year,
      cars.vin,
      cars.created_at,
      models.name AS model_name,
      brands.name AS brand_name,
      car_colors.name AS color_name,
      car_colors.hex_code
    FROM cars
    INNER JOIN models ON cars.model_id = models.id
    INNER JOIN brands ON models.brand_id = brands.id
    INNER JOIN car_colors ON cars.color_id = car_colors.id
    ORDER BY cars.id
  `);

  // Возвращаем массив строк с объединёнными данными
  return result.rows;
};

/**
 * Получает один автомобиль по ID с JOIN-ом связанных таблиц
 * @function getCarById
 * @param {number} id - идентификатор автомобиля
 * @returns {Promise<CarData | undefined>} объект автомобиля или undefined если не найден
 */
export const getCarById = async (id) => {
  // Аналогичный JOIN запрос, но с WHERE для конкретного id
  const result = await pool.query(
    `
    SELECT
      cars.id,
      cars.model_id,
      cars.color_id,
      cars.year,
      cars.vin,
      cars.created_at,
      models.name AS model_name,
      brands.name AS brand_name,
      car_colors.name AS color_name,
      car_colors.hex_code
    FROM cars
    INNER JOIN models ON cars.model_id = models.id
    INNER JOIN brands ON models.brand_id = brands.id
    INNER JOIN car_colors ON cars.color_id = car_colors.id
    WHERE cars.id = $1
  `,
    [id],
  );

  // Возвращаем первую строку или undefined
  return result.rows[0];
};

/**
 * Создаёт новый автомобиль в базе данных
 * @function createCar
 * @param {CreateCarOpts} carData - данные для создания автомобиля
 * @returns {Promise<CarData>} созданный объект автомобиля
 */
export const createCar = async (carData) => {
  // Деструктуризация - извлекаем поля из объекта carData
  const { model_id, color_id, year, vin } = carData;

  // INSERT INTO - вставляем новую строку
  // RETURNING * - возвращаем вставленную строку (со сгенерированным id)
  const result = await pool.query(
    'INSERT INTO cars (model_id, color_id, year, vin) VALUES ($1, $2, $3, $4) RETURNING *',
    [model_id, color_id, year, vin],
  );

  // Возвращаем созданный объект автомобиля
  return result.rows[0];
};

/**
 * Обновляет существующий автомобиль
 * @function updateCar
 * @param {number} id - идентификатор автомобиля
 * @param {UpdateCarOpts} carData - новые данные автомобиля
 * @returns {Promise<CarData | undefined>} обновлённый автомобиль или undefined если не найден
 */
export const updateCar = async (id, carData) => {
  // Деструктуризация - извлекаем поля из объекта carData
  const { model_id, color_id, year, vin } = carData;

  // UPDATE - обновляем строку
  // SET - устанавливаем новые значения для всех полей
  // WHERE id = $1 - только для автомобиля с указанным id
  const result = await pool.query(
    'UPDATE cars SET model_id = $2, color_id = $3, year = $4, vin = $5 WHERE id = $1 RETURNING *',
    [id, model_id, color_id, year, vin],
  );

  // Если автомобиль с таким id не найден, result.rows[0] будет undefined
  return result.rows[0];
};

/**
 * Удаляет автомобиль из базы данных
 * @function deleteCar
 * @param {number} id - идентификатор автомобиля
 * @returns {Promise<CarData | undefined>} удалённый автомобиль или undefined если не найден
 */
export const deleteCar = async (id) => {
  // DELETE FROM - удаляем строку
  // RETURNING * - возвращаем удалённую строку (для подтверждения)
  const result = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING *', [id]);

  // Возвращаем удалённый объект или undefined если не найден
  return result.rows[0];
};

// ============================================
// MODELS - функции для работы с моделями
// ============================================

/**
 * Получает все модели из базы данных с JOIN бренда
 * @function getAllModels
 * @returns {Promise<ModelData[]>} массив всех моделей с данными бренда
 */
export const getAllModels = async () => {
  // JOIN для получения названия бренда
  const result = await pool.query(`
    SELECT
      models.id,
      models.brand_id,
      models.name,
      models.created_at,
      brands.name AS brand_name
    FROM models
    INNER JOIN brands ON models.brand_id = brands.id
    ORDER BY models.id
  `);

  return result.rows;
};

/**
 * Получает одну модель по ID
 * @function getModelById
 * @param {number} id - идентификатор модели
 * @returns {Promise<ModelData | undefined>} объект модели или undefined
 */
export const getModelById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      models.id,
      models.brand_id,
      models.name,
      models.created_at,
      brands.name AS brand_name
    FROM models
    INNER JOIN brands ON models.brand_id = brands.id
    WHERE models.id = $1
  `,
    [id],
  );

  return result.rows[0];
};

/**
 * Создаёт новую модель
 * @function createModel
 * @param {CreateModelOpts} modelData - данные для создания модели
 * @returns {Promise<ModelData>} созданный объект модели
 */
export const createModel = async (modelData) => {
  const { brand_id, name } = modelData;

  const result = await pool.query(
    'INSERT INTO models (brand_id, name) VALUES ($1, $2) RETURNING *',
    [brand_id, name],
  );

  return result.rows[0];
};

/**
 * Обновляет существующую модель
 * @function updateModel
 * @param {number} id - идентификатор модели
 * @param {CreateModelOpts} modelData - новые данные модели
 * @returns {Promise<ModelData | undefined>} обновлённая модель или undefined
 */
export const updateModel = async (id, modelData) => {
  const { brand_id, name } = modelData;

  const result = await pool.query(
    'UPDATE models SET brand_id = $2, name = $3 WHERE id = $1 RETURNING *',
    [id, brand_id, name],
  );

  return result.rows[0];
};

/**
 * Удаляет модель из базы данных
 * @function deleteModel
 * @param {number} id - идентификатор модели
 * @returns {Promise<ModelData | undefined>} удалённая модель или undefined
 */
export const deleteModel = async (id) => {
  const result = await pool.query('DELETE FROM models WHERE id = $1 RETURNING *', [id]);

  return result.rows[0];
};

// ============================================
// BRANDS - функции для работы с брендами
// ============================================

/**
 * Получает все бренды из базы данных
 * @function getAllBrands
 * @returns {Promise<BrandData[]>} массив всех брендов
 */
export const getAllBrands = async () => {
  const result = await pool.query('SELECT * FROM brands ORDER BY id');
  return result.rows;
};

/**
 * Получает один бренд по ID
 * @function getBrandById
 * @param {number} id - идентификатор бренда
 * @returns {Promise<BrandData | undefined>} объект бренда или undefined
 */
export const getBrandById = async (id) => {
  const result = await pool.query('SELECT * FROM brands WHERE id = $1', [id]);
  return result.rows[0];
};

/**
 * Создаёт новый бренд
 * @function createBrand
 * @param {CreateBrandOpts} brandData - данные для создания бренда
 * @returns {Promise<BrandData>} созданный объект бренда
 */
export const createBrand = async (brandData) => {
  const { name } = brandData;

  const result = await pool.query('INSERT INTO brands (name) VALUES ($1) RETURNING *', [name]);

  return result.rows[0];
};

/**
 * Обновляет существующий бренд
 * @function updateBrand
 * @param {number} id - идентификатор бренда
 * @param {CreateBrandOpts} brandData - новые данные бренда
 * @returns {Promise<BrandData | undefined>} обновлённый бренд или undefined
 */
export const updateBrand = async (id, brandData) => {
  const { name } = brandData;

  const result = await pool.query('UPDATE brands SET name = $2 WHERE id = $1 RETURNING *', [
    id,
    name,
  ]);

  return result.rows[0];
};

/**
 * Удаляет бренд из базы данных
 * @function deleteBrand
 * @param {number} id - идентификатор бренда
 * @returns {Promise<BrandData | undefined>} удалённый бренд или undefined
 */
export const deleteBrand = async (id) => {
  const result = await pool.query('DELETE FROM brands WHERE id = $1 RETURNING *', [id]);

  return result.rows[0];
};

// ============================================
// CAR_COLORS - функции для работы с цветами
// ============================================

/**
 * Получает все цвета автомобилей из базы данных
 * @function getAllCarColors
 * @returns {Promise<CarColorData[]>} массив всех цветов
 */
export const getAllCarColors = async () => {
  const result = await pool.query('SELECT * FROM car_colors ORDER BY id');
  return result.rows;
};

/**
 * Получает один цвет по ID
 * @function getCarColorById
 * @param {number} id - идентификатор цвета
 * @returns {Promise<CarColorData | undefined>} объект цвета или undefined
 */
export const getCarColorById = async (id) => {
  const result = await pool.query('SELECT * FROM car_colors WHERE id = $1', [id]);
  return result.rows[0];
};

/**
 * Создаёт новый цвет автомобиля
 * @function createCarColor
 * @param {CreateCarColorOpts} colorData - данные для создания цвета
 * @returns {Promise<CarColorData>} созданный объект цвета
 */
export const createCarColor = async (colorData) => {
  const { name, hex_code } = colorData;

  const result = await pool.query(
    'INSERT INTO car_colors (name, hex_code) VALUES ($1, $2) RETURNING *',
    [name, hex_code],
  );

  return result.rows[0];
};

/**
 * Обновляет существующий цвет автомобиля
 * @function updateCarColor
 * @param {number} id - идентификатор цвета
 * @param {CreateCarColorOpts} colorData - новые данные цвета
 * @returns {Promise<CarColorData | undefined>} обновлённый цвет или undefined
 */
export const updateCarColor = async (id, colorData) => {
  const { name, hex_code } = colorData;

  const result = await pool.query(
    'UPDATE car_colors SET name = $2, hex_code = $3 WHERE id = $1 RETURNING *',
    [id, name, hex_code],
  );

  return result.rows[0];
};

/**
 * Удаляет цвет автомобиля из базы данных
 * @function deleteCarColor
 * @param {number} id - идентификатор цвета
 * @returns {Promise<CarColorData | undefined>} удалённый цвет или undefined
 */
export const deleteCarColor = async (id) => {
  const result = await pool.query('DELETE FROM car_colors WHERE id = $1 RETURNING *', [id]);

  return result.rows[0];
};
