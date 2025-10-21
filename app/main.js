import createServer from 'fastify';
import { initController } from './controller.js';

const serverOpts = {
  logger: true,
  ajv: {
    customOptions: {
      coerceTypes: true,
    },
  },
};

const server = createServer(serverOpts);
const routes = initController();

for (const route of routes) server.route(route);

server.listen({ port: 5000 });
