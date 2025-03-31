import fastify, { FastifyError } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config';
import { ethereumRoutes } from './routes/ethereum';
import { errorHandler } from './middleware/error-handler';
import { logger } from './utils/logger';

const server = fastify({
  logger: {
    level: 'info',
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          hostname: request.hostname,
          remoteAddress: request.ip,
          userAgent: request.headers['user-agent'],
        };
      },
      err(err: Error) {
        return {
          type: err.name,
          message: err.message,
          stack: err.stack || '',
        };
      },
    },
  },
});

// Register plugins
server.register(cors, {
  origin: config.cors.origin,
  credentials: true
});

server.register(jwt, {
  secret: config.jwt.secret
});

server.register(swagger, {
  swagger: {
    info: {
      title: 'DeFi IDE Platform API',
      description: 'API documentation for DeFi IDE Platform',
      version: '1.0.0'
    },
    host: config.server.host,
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
});

server.register(swaggerUi, {
  routePrefix: '/documentation'
});

// Register routes
server.register(ethereumRoutes, { prefix: '/api/v1/ethereum' });

// Register error handler
server.setErrorHandler((error: FastifyError, request, reply) => {
  logger.error(error);
  reply.status(error.statusCode || 500).send({
    error: {
      message: error.message || 'Internal Server Error',
    },
  });
});

// Start server
const start = async () => {
  try {
    await server.listen({ 
      port: config.server.port,
      host: config.server.host 
    });
    logger.info(`Server is running on ${config.server.host}:${config.server.port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start(); 