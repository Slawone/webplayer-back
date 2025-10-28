import {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getAllModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  getAllCarColors,
  getCarColorById,
  createCarColor,
  updateCarColor,
  deleteCarColor,
} from './service.js';

/**
 * @typedef {import('../../types').RouteOpts} RouteOpts
 * @typedef {import('./types/car.js').CreateCarOpts} CreateCarOpts
 * @typedef {import('./types/car.js').UpdateCarOpts} UpdateCarOpts
 * @typedef {import('./types/car.js').IdParams} IdParams
 * @typedef {import('./types/car.js').PostgresError} PostgresError
 * @typedef {import('./types/car.js').CreateModelOpts} CreateModelOpts
 * @typedef {import('./types/car.js').CreateBrandOpts} CreateBrandOpts
 * @typedef {import('./types/car.js').CreateCarColorOpts} CreateCarColorOpts
 */

/**
 * Инициализирует контроллер и возвращает массив роутов для автомобилей
 * @function initCarsController
 * @returns {RouteOpts[]}>}
 */

export const initCarsController = () => [
  // ============================================
  // GET /cars - получить все автомобили
  // ============================================
  {
    method: 'GET',
    url: '/cars',
    handler: async (req, reply) => {
      try {
        // Вызываем функцию для получения всех автомобилей с JOIN-ом
        const cars = await getAllCars();
        reply.send(cars);
      } catch (err) {
        // Приводим error к типу any, затем к PostgresError
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);
        reply.status(500).send({
          error: 'Ошибка при получении автомобилей',
        });
      }
    },
  },

  // ============================================
  // GET /cars/:id - получить автомобиль по ID
  // ============================================
  {
    method: 'GET',
    url: '/cars/:id',
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

        const car = await getCarById(id);

        if (!car) {
          return reply.status(404).send({
            error: 'Автомобиль не найден',
          });
        }

        reply.send(car);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);
        reply.status(500).send({
          error: 'Ошибка при получении автомобиля',
        });
      }
    },
  },

  // ============================================
  // POST /cars - создать новый автомобиль
  // ============================================
  {
    method: 'POST',
    url: '/cars',
    schema: {
      body: {
        type: 'object',
        required: ['model_id', 'color_id', 'year', 'vin'],
        properties: {
          model_id: {
            type: 'integer',
            minimum: 1,
          },
          color_id: {
            type: 'integer',
            minimum: 1,
          },
          year: {
            type: 'integer',
            minimum: 1900,
            maximum: 2100,
          },
          vin: {
            type: 'string',
            minLength: 17,
            maxLength: 17,
            pattern: '^[A-HJ-NPR-Z0-9]{17}$', // VIN формат (без I, O, Q)
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqBody = req.body;
        const /** @type {CreateCarOpts} */ carData = reqBody;

        const newCar = await createCar(carData);

        reply.status(201).send(newCar);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);

        // 23503 - нарушение внешнего ключа (model_id или color_id не существует)
        if (pgError.code === '23503') {
          return reply.status(400).send({
            error: 'Указанная модель или цвет не существуют',
          });
        }

        // 23505 - нарушение уникальности (VIN уже существует)
        if (pgError.code === '23505') {
          return reply.status(409).send({
            error: 'Автомобиль с таким VIN уже существует',
          });
        }

        reply.status(500).send({
          error: 'Ошибка при создании автомобиля',
        });
      }
    },
  },

  // ============================================
  // PUT /cars/:id - обновить автомобиль
  // ============================================
  {
    method: 'PUT',
    url: '/cars/:id',
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
      body: {
        type: 'object',
        required: ['model_id', 'color_id', 'year', 'vin'],
        properties: {
          model_id: {
            type: 'integer',
            minimum: 1,
          },
          color_id: {
            type: 'integer',
            minimum: 1,
          },
          year: {
            type: 'integer',
            minimum: 1900,
            maximum: 2100,
          },
          vin: {
            type: 'string',
            minLength: 17,
            maxLength: 17,
            pattern: '^[A-HJ-NPR-Z0-9]{17}$',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;
        const id = parseInt(params.id);

        const /** @type {*} */ reqBody = req.body;
        const /** @type {UpdateCarOpts} */ carData = reqBody;

        const updatedCar = await updateCar(id, carData);

        if (!updatedCar) {
          return reply.status(404).send({
            error: 'Автомобиль не найден',
          });
        }

        reply.send(updatedCar);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);

        if (pgError.code === '23503') {
          return reply.status(400).send({
            error: 'Указанная модель или цвет не существуют',
          });
        }

        if (pgError.code === '23505') {
          return reply.status(409).send({
            error: 'Автомобиль с таким VIN уже существует',
          });
        }

        reply.status(500).send({
          error: 'Ошибка при обновлении автомобиля',
        });
      }
    },
  },

  // ============================================
  // DELETE /cars/:id - удалить автомобиль
  // ============================================
  {
    method: 'DELETE',
    url: '/cars/:id',
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

        const deletedCar = await deleteCar(id);

        if (!deletedCar) {
          return reply.status(404).send({
            error: 'Автомобиль не найден',
          });
        }

        reply.send(deletedCar);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);
        reply.status(500).send({
          error: 'Ошибка при удалении автомобиля',
        });
      }
    },
  },
];

/**
 * Инициализирует контроллер и возвращает массив роутов для моделей
 * @function initModelsController
 * @returns {RouteOpts[]}
 */
export const initModelsController = () => [
  // GET /models - получить все модели
  {
    method: 'GET',
    url: '/models',
    handler: async (req, reply) => {
      try {
        const models = await getAllModels();
        reply.send(models);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);
        reply.status(500).send({
          error: 'Ошибка при получении моделей',
        });
      }
    },
  },

  // GET /models/:id - получить модель по ID
  {
    method: 'GET',
    url: '/models/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9]+',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;
        const id = parseInt(params.id);

        const model = await getModelById(id);

        if (!model) {
          return reply.status(404).send({
            error: 'Модель не найдена',
          });
        }

        reply.send(model);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);
        reply.status(500).send({
          error: 'Ошибка при получении модели',
        });
      }
    },
  },

  // POST /models - создать новую модель
  {
    method: 'POST',
    url: '/models',
    schema: {
      body: {
        type: 'object',
        required: ['brand_id', 'name'],
        properties: {
          brand_id: {
            type: 'integer',
            minimum: 1,
          },
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqBody = req.body;
        const /** @type {CreateModelOpts} */ modelData = reqBody;

        const newModel = await createModel(modelData);

        reply.status(201).send(newModel);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);

        // 23503 - нарушение внешнего ключа (brand_id не существует)
        if (pgError.code === '23503') {
          return reply.status(400).send({
            error: 'Указанный бренд не существует',
          });
        }

        reply.status(500).send({
          error: 'Ошибка при создании модели',
        });
      }
    },
  },

  // PUT /models/:id - обновить модель
  {
    method: 'PUT',
    url: '/models/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9]+',
          },
        },
      },
      body: {
        type: 'object',
        required: ['brand_id', 'name'],
        properties: {
          brand_id: {
            type: 'integer',
            minimum: 1,
          },
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;
        const id = parseInt(params.id);

        const /** @type {*} */ reqBody = req.body;
        const /** @type {CreateModelOpts} */ modelData = reqBody;

        const updatedModel = await updateModel(id, modelData);

        if (!updatedModel) {
          return reply.status(404).send({
            error: 'Модель не найдена',
          });
        }

        reply.send(updatedModel);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);

        if (pgError.code === '23503') {
          return reply.status(400).send({
            error: 'Указанный бренд не существует',
          });
        }

        reply.status(500).send({
          error: 'Ошибка при обновлении модели',
        });
      }
    },
  },

  // DELETE /models/:id - удалить модель
  {
    method: 'DELETE',
    url: '/models/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9]+',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;
        const id = parseInt(params.id);

        const deletedModel = await deleteModel(id);

        if (!deletedModel) {
          return reply.status(404).send({
            error: 'Модель не найдена',
          });
        }

        reply.send(deletedModel);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);

        // 23503 - нарушение внешнего ключа (есть автомобили с этой моделью)
        if (pgError.code === '23503') {
          return reply.status(400).send({
            error: 'Невозможно удалить модель, так как существуют автомобили с этой моделью',
          });
        }

        reply.status(500).send({
          error: 'Ошибка при удалении модели',
        });
      }
    },
  },
];

/**
 * Инициализирует контроллер и возвращает массив роутов для брендов
 * @function initBrandsController
 * @returns {RouteOpts[]}
 */
export const initBrandsController = () => [
  // GET /brands - получить все бренды
  {
    method: 'GET',
    url: '/brands',
    handler: async (req, reply) => {
      try {
        const brands = await getAllBrands();
        reply.send(brands);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);
        reply.status(500).send({
          error: 'Ошибка при получении брендов',
        });
      }
    },
  },

  // GET /brands/:id - получить бренд по ID
  {
    method: 'GET',
    url: '/brands/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9]+',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;
        const id = parseInt(params.id);

        const brand = await getBrandById(id);

        if (!brand) {
          return reply.status(404).send({
            error: 'Бренд не найден',
          });
        }

        reply.send(brand);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);
        reply.status(500).send({
          error: 'Ошибка при получении бренда',
        });
      }
    },
  },

  // POST /brands - создать новый бренд
  {
    method: 'POST',
    url: '/brands',
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqBody = req.body;
        const /** @type {CreateBrandOpts} */ brandData = reqBody;

        const newBrand = await createBrand(brandData);

        reply.status(201).send(newBrand);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);

        // 23505 - нарушение уникальности (бренд с таким именем уже существует)
        if (pgError.code === '23505') {
          return reply.status(409).send({
            error: 'Бренд с таким именем уже существует',
          });
        }

        reply.status(500).send({
          error: 'Ошибка при создании бренда',
        });
      }
    },
  },

  // PUT /brands/:id - обновить бренд
  {
    method: 'PUT',
    url: '/brands/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9]+',
          },
        },
      },
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;
        const id = parseInt(params.id);

        const /** @type {*} */ reqBody = req.body;
        const /** @type {CreateBrandOpts} */ brandData = reqBody;

        const updatedBrand = await updateBrand(id, brandData);

        if (!updatedBrand) {
          return reply.status(404).send({
            error: 'Бренд не найден',
          });
        }

        reply.send(updatedBrand);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);

        if (pgError.code === '23505') {
          return reply.status(409).send({
            error: 'Бренд с таким именем уже существует',
          });
        }

        reply.status(500).send({
          error: 'Ошибка при обновлении бренда',
        });
      }
    },
  },

  // DELETE /brands/:id - удалить бренд
  {
    method: 'DELETE',
    url: '/brands/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9]+',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;
        const id = parseInt(params.id);

        const deletedBrand = await deleteBrand(id);

        if (!deletedBrand) {
          return reply.status(404).send({
            error: 'Бренд не найден',
          });
        }

        reply.send(deletedBrand);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);

        // 23503 - есть модели с этим брендом (CASCADE удалит их автоматически)
        if (pgError.code === '23503') {
          return reply.status(400).send({
            error: 'Невозможно удалить бренд, так как существуют связанные модели',
          });
        }

        reply.status(500).send({
          error: 'Ошибка при удалении бренда',
        });
      }
    },
  },
];

/**
 * Инициализирует контроллер и возвращает массив роутов для цветов автомобилей
 * @function initCarColorsController
 * @returns {RouteOpts[]}
 */
export const initCarColorsController = () => [
  // GET /car-colors - получить все цвета
  {
    method: 'GET',
    url: '/car-colors',
    handler: async (req, reply) => {
      try {
        const colors = await getAllCarColors();
        reply.send(colors);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);
        reply.status(500).send({
          error: 'Ошибка при получении цветов',
        });
      }
    },
  },

  // GET /car-colors/:id - получить цвет по ID
  {
    method: 'GET',
    url: '/car-colors/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9]+',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;
        const id = parseInt(params.id);

        const color = await getCarColorById(id);

        if (!color) {
          return reply.status(404).send({
            error: 'Цвет не найден',
          });
        }

        reply.send(color);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);
        reply.status(500).send({
          error: 'Ошибка при получении цвета',
        });
      }
    },
  },

  // POST /car-colors - создать новый цвет
  {
    method: 'POST',
    url: '/car-colors',
    schema: {
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
            pattern: '^#[0-9A-Fa-f]{6}',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqBody = req.body;
        const /** @type {CreateCarColorOpts} */ colorData = reqBody;

        const newColor = await createCarColor(colorData);

        reply.status(201).send(newColor);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);
        reply.status(500).send({
          error: 'Ошибка при создании цвета',
        });
      }
    },
  },

  // PUT /car-colors/:id - обновить цвет
  {
    method: 'PUT',
    url: '/car-colors/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9]+',
          },
        },
      },
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
            pattern: '^#[0-9A-Fa-f]{6}',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;
        const id = parseInt(params.id);

        const /** @type {*} */ reqBody = req.body;
        const /** @type {CreateCarColorOpts} */ colorData = reqBody;

        const updatedColor = await updateCarColor(id, colorData);

        if (!updatedColor) {
          return reply.status(404).send({
            error: 'Цвет не найден',
          });
        }

        reply.send(updatedColor);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);
        reply.status(500).send({
          error: 'Ошибка при обновлении цвета',
        });
      }
    },
  },

  // DELETE /car-colors/:id - удалить цвет
  {
    method: 'DELETE',
    url: '/car-colors/:id',
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9]+',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const /** @type {*} */ reqParams = req.params;
        const /** @type {IdParams} */ params = reqParams;
        const id = parseInt(params.id);

        const deletedColor = await deleteCarColor(id);

        if (!deletedColor) {
          return reply.status(404).send({
            error: 'Цвет не найден',
          });
        }

        reply.send(deletedColor);
      } catch (err) {
        const /** @type {*} */ error = err;
        const /** @type {PostgresError} */ pgError = error;

        req.log.error(pgError);

        // 23503 - есть автомобили с этим цветом
        if (pgError.code === '23503') {
          return reply.status(400).send({
            error: 'Невозможно удалить цвет, так как существуют автомобили с этим цветом',
          });
        }

        reply.status(500).send({
          error: 'Ошибка при удалении цвета',
        });
      }
    },
  },
];
export { getAllCars };
