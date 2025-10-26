import { getAllColors, getColorById, createColor, updateColor, deleteColor } from './service.js';

/**
 * @typedef {import('../../types').RouteOpts} RouteOpts
 * @typedef {import('./types/colors').CreateColorOpts} CreateColorOpts
 * @typedef {import('./types/colors').UpdateColorOpts} UpdateColorOpts
 * @typedef {import('./types/colors').IdParams} IdParams
 */

/**
 * @function initController
 * @description Инициализирует контроллер и возвращает массив роутов
 * @returns {RouteOpts[]}
 */

export const initController = () => [
  // ============================================
  // GET /colors - получить все цвета
  // ============================================
  {
    method: 'GET', // HTTP метод
    url: '/', // путь относительно префикса /colors
    handler: async (req, reply) => {
      // try-catch блок для обработки ошибок
      try {
        // Вызываем функцию для получения всех цветов из БД
        const colors = await getAllColors();

        // reply.send отправляет ответ клиенту
        // Fastify автоматически установит Content-Type: application/json
        reply.send(colors);
      } catch (error) {
        // Если произошла ошибка, логируем её через встроенный логгер Fastify
        req.log.error(error);

        // Отправляем ответ с кодом 500 (Internal Server Error)
        reply.status(500).send({
          error: 'Ошибка при получении цветов',
        });
      }
    },
  },

  // ============================================
  // GET /colors/:id - получить цвет по ID
  // ============================================
  {
    method: 'GET',
    url: '/:id', // :id - параметр в URL
    schema: {
      // Схема валидации параметров URL
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9]+$', // только цифры
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        // req.params содержит параметры из URL
        // parseInt преобразует строку в число
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;

        const id = parseInt(params.id);

        // Получаем цвет из БД по ID
        const color = await getColorById(id);

        // Если цвет не найден (undefined)
        if (!color) {
          // Возвращаем 404 (Not Found)
          return reply.status(404).send({
            error: 'Цвет не найден',
          });
        }

        // Если найден, возвращаем его
        reply.send(color);
      } catch (error) {
        req.log.error(error);
        reply.status(500).send({
          error: 'Ошибка при получении цвета',
        });
      }
    },
  },

  // ============================================
  // POST /colors - создать новый цвет
  // ============================================
  {
    method: 'POST',
    url: '/',
    schema: {
      // Схема валидации тела запроса (body)
      body: {
        type: 'object', // body должен быть объектом
        required: ['name', 'hex_code'], // обязательные поля
        properties: {
          // описание каждого поля
          name: {
            type: 'string', // name должен быть строкой
            minLength: 1, // минимум 1 символ
            maxLength: 100, // максимум 100 символов
          },
          hex_code: {
            type: 'string', // hex_code должен быть строкой
            // pattern - регулярное выражение для проверки формата HEX цвета
            // ^ - начало строки
            // # - символ решётки
            // [0-9A-Fa-f]{6} - ровно 6 символов (цифры 0-9 или буквы A-F)
            // $ - конец строки
            pattern: '^#[0-9A-Fa-f]{6}$',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        // req.body содержит данные из тела запроса
        // Приводим тип к any для удобства, затем к нужному типу
        const /** @type {*} */ reqBody = req.body;
        const /** @type {CreateColorOpts} */ colorData = reqBody;

        // Создаём новый цвет в БД
        const newColor = await createColor(colorData);

        // Возвращаем 201 (Created) - ресурс успешно создан
        reply.status(201).send(newColor);
      } catch (error) {
        req.log.error(error);

        // Проверяем, не нарушили ли мы уникальность (если есть UNIQUE constraint)
        // error.code === '23505' - код ошибки PostgreSQL для нарушения уникальности
        // @ts-ignore
        if (error.code === '23505') {
          return reply.status(409).send({
            error: 'Цвет с таким именем уже существует',
          });
        }

        reply.status(500).send({
          error: 'Ошибка при создании цвета',
        });
      }
    },
  },

  // ============================================
  // PUT /colors/:id - обновить цвет
  // ============================================
  {
    method: 'PUT',
    url: '/:id',
    schema: {
      // Валидация параметров URL
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9]+$',
          },
        },
      },
      // Валидация тела запроса
      body: {
        type: 'object',
        required: ['name', 'hex_code'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
          hex_code: {
            type: 'string',
            pattern: '^#[0-9A-Fa-f]{6}$',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        // Извлекаем id из URL параметров
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;

        const id = parseInt(params.id);

        // Извлекаем новые данные из тела запроса
        const /** @type {*} */ reqBody = req.body;
        const /** @type {UpdateColorOpts} */ colorData = reqBody;

        // Обновляем цвет в БД
        const updatedColor = await updateColor(id, colorData);

        // Если цвет с таким id не найден
        if (!updatedColor) {
          return reply.status(404).send({
            error: 'Цвет не найден',
          });
        }

        // Возвращаем обновлённый цвет
        reply.send(updatedColor);
      } catch (error) {
        req.log.error(error);
        reply.status(500).send({
          error: 'Ошибка при обновлении цвета',
        });
      }
    },
  },

  // ============================================
  // DELETE /colors/:id - удалить цвет
  // ============================================
  {
    method: 'DELETE',
    url: '/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9]+$',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;

        const id = parseInt(params.id);

        // Удаляем цвет из БД
        const deletedColor = await deleteColor(id);

        // Если цвет с таким id не найден
        if (!deletedColor) {
          return reply.status(404).send({
            error: 'Цвет не найден',
          });
        }

        // Возвращаем информацию об удалённом цвете
        reply.send(deletedColor);
      } catch (error) {
        req.log.error(error);
        reply.status(500).send({
          error: 'Ошибка при удалении цвета',
        });
      }
    },
  },
];
