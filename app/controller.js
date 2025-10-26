import { initController as initGetRegController } from './services/user/controller.js';
import { initController as initColorsController } from './services/colors/controller.js';

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

  return [...getRegRoutes, ...colorsRoutes];
};
