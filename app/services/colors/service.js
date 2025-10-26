// @ts-ignore
import pg from 'pg';

/**
 * @typedef {import('./types/colors').CreateColorOpts} CreateColorOpts
 * @typedef {import('./types/colors').UpdateColorOpts} UpdateColorOpts
 * @typedef {import('./types/colors').ColorData} ColorData
 */

const { Pool } = pg;

const pool = new Pool({
  host: '185.171.82.58',
  port: '5432',
  database: 'default_db',
  user: 'gen_user',
  password: 'exc53=#@Qz8kAQd',
});

/**
 * @function getAllColors
 * @description Получает все цвета из базы данных
 * @returns {Promise<ColorData[]>} массив всех цветов
 */

export const getAllColors = async () => {
  // pool.query выполняет SQL запрос к базе данных
  // await - ждём завершения асинхронной операции
  const result = await pool.query(
    // SELECT - выбираем данные
    // '*' - все колонки
    // FROM colors - из таблицы colors
    // ORDER BY id - сортируем по id по возрастанию
    'SELECT * FROM colors ORDER BY id',
  );

  return result.rows;
};

/**
 * @function getColorById
 * @description Получает один цвет по ID
 * @param {number} id - идентификатор цвета
 * @returns {Promise<ColorData | undefined>} объект цвета или undefined если не найден
 */

export const getColorById = async (id) => {
  // $1 - это плейсхолдер (заполнитель) для параметра
  // Второй аргумент [id] - массив значений, которые подставятся вместо $1, $2 и т.д.
  // Это защищает от SQL-инъекций!
  const result = await pool.query(
    'SELECT * FROM colors WHERE id = $1',
    [id], // значение подставится вместо $1
  );

  // result.rows[0] - первая (и единственная) строка результата
  // Если цвет не найден, вернётся undefined
  return result.rows[0];
};

/**
 * @function createColor
 * @description Создаёт новый цвет в базе данных
 * @param {CreateColorOpts} colorData - данные для создания цвета
 * @returns {Promise<ColorData>} созданный объект цвета
 */

export const createColor = async (colorData) => {
  // Деструктуризация - извлекаем поля из объекта colorData
  const { name, hex_code } = colorData;

  // INSERT INTO - вставляем новую строку
  // RETURNING * - возвращаем вставленную строку (со сгенерированным id)
  const result = await pool.query(
    'INSERT INTO colors (name, hex_code) VALUES ($1, $2) RETURNING *',
    [name, hex_code], // $1 = name, $2 = hex_code
  );

  // Возвращаем созданный объект цвета
  return result.rows[0];
};

/**
 * @function updateColor
 * @description Обновляет существующий цвет
 * @param {number} id - идентификатор цвета
 * @param {UpdateColorOpts} colorData - новые данные цвета
 * @returns {Promise<ColorData | undefined>} обновлённый цвет или undefined если не найден
 */

export const updateColor = async (id, colorData) => {
  // Деструктуризация - извлекаем поля из объекта colorData
  const { name, hex_code } = colorData;

  // UPDATE - обновляем строку
  // SET - устанавливаем новые значения
  // WHERE id = $1 - только для цвета с указанным id
  const result = await pool.query(
    'UPDATE colors SET name = $2, hex_code = $3 WHERE id = $1 RETURNING *',
    [id, name, hex_code], // $1 = id, $2 = name, $3 = hex_code
  );

  // Если цвет с таким id не найден, result.rows[0] будет undefined
  return result.rows[0];
};

/**
 * @function deleteColor
 * @description Удаляет цвет из базы данных
 * @param {number} id - идентификатор цвета
 * @returns {Promise<ColorData | undefined>} удалённый цвет или undefined если не найден
 */

export const deleteColor = async (id) => {
  // DELETE FROM - удаляем строку
  // RETURNING * - возвращаем удалённую строку (для подтверждения)
  const result = await pool.query('DELETE FROM colors WHERE id = $1 RETURNING *', [id]);

  // Возвращаем удалённый объект или undefined если не найден
  return result.rows[0];
};
