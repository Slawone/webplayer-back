import { getRegData } from './service.js';

/**
 * @typedef {import('../../types').RouteOpts} RouteOpts
 * @typedef {import('./types').RegDataOpts} RegDataOpts
 */

/**
 * @function initController
 * @returns {RouteOpts[]}
 */

export const initController = () => [
  {
    method: 'POST',
    url: '/register',
    // schema: {
    //   body: {
    //     type: 'object',
    //     required: ['email', 'name'],
    //     properties: {
    //       email: {
    //         type: 'string',
    //         format: 'email',
    //       },
    //       name: {
    //         type: 'string',
    //       },
    //     },
    //   },
    // },
    handler: async (req, reply) => {
      const /** @type {*} */ reqBody = req.body;
      const /** @type {RegDataOpts} */ regData = reqBody;
      const result = getRegData(regData);
      reply.send(result);
    },
  },
];
