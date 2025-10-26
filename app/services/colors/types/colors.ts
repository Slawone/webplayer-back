/**
 * Тип данных для создания нового цвета
 */
export type CreateColorOpts = {
  name: string;
  hex_code: string;
};

/**
 * Тип данных для обновления цвета
 */
export type UpdateColorOpts = {
  name: string;
  hex_code: string;
};

/**
 * Тип данных цвета, возвращаемого из БД
 */
export type ColorData = {
  id: number;
  name: string;
  hex_code: string;
  created_at: Date;
};

export type IdParams = {
  id: string;
};