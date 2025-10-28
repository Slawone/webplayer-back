/**
 * Тип данных для создания нового автомобиля
 */
export type CreateCarOpts = {
  model_id: number;
  color_id: number;
  year: number;
  vin: string;
};

/**
 * Тип данных для обновления автомобиля
 */
export type UpdateCarOpts = {
  model_id: number;
  color_id: number;
  year: number;
  vin: string;
};

/**
 * Тип данных автомобиля, возвращаемого из БД
 */
export type CarData = {
  id: number;
  model_id: number;
  color_id: number;
  year: number;
  vin: string;
  created_at: Date;
  model_name?: string;
  brand_name?: string;
  color_name?: string;
  hex_code?: string;
};

/**
 * Тип параметров URL с id
 */
export type IdParams = {
  id: string;
};

/**
 * Тип ошибки PostgreSQL
 */
export type PostgresError = {
  code?: string;
  message?: string;
};

/**
 * Тип данных для создания модели
 */
export type CreateModelOpts = {
  brand_id: number;
  name: string;
};

/**
 * Тип данных модели
 */
export type ModelData = {
  id: number;
  brand_id: number;
  name: string;
  created_at: Date;
  brand_name?: string;
};

/**
 * Тип данных для создания бренда
 */
export type CreateBrandOpts = {
  name: string;
};

/**
 * Тип данных бренда
 */
export type BrandData = {
  id: number;
  name: string;
  created_at: Date;
};

/**
 * Тип данных для создания цвета
 */
export type CreateCarColorOpts = {
  name: string;
  hex_code: string;
};

/**
 * Тип данных цвета автомобиля
 */
export type CarColorData = {
  id: number;
  name: string;
  hex_code: string;
  created_at: Date;
};
