import { initController as initGetRegController } from './services/user/controller.js';
import { initController as initColorsController } from './services/colors/controller.js';
import {
  initCarsController,
  initModelsController,
  initBrandsController,
  initCarColorsController,
} from './services/cars/controller.js';

/**
 * @typedef {import('fastify').RouteOptions} RouteOpts
 */

/**
 * @function initController
 * @returns {RouteOpts[]}
 */

export const initController = () => {
  const getRegRoutes = initGetRegController();
  const colorsRoutes = initColorsController();
  const carsRoutes = initCarsController();
  const modelsRoutes = initModelsController();
  const brandRoutes = initBrandsController();
  const carColorsRoutes = initCarColorsController();

  return [
    ...getRegRoutes,
    ...colorsRoutes,
    ...carsRoutes,
    ...modelsRoutes,
    ...brandRoutes,
    ...carColorsRoutes,
  ];
};
