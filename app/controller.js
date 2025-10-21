import { initController as initGetRegController } from './services/user/controller.js';

/**
 * @typedef {import('fastify').RouteOptions} RouteOpts
 */

/**
 * @function initController
 * @returns {RouteOpts[]}
 */

export const initController = () => {
  const getRegRoutes = initGetRegController();

  return [...getRegRoutes];
};
