import Fastify from 'fastify';
import cors from '@fastify/cors';
import * as dotenv from 'dotenv';
import compareRoutes from './routes/compare';

// Load environment variables
dotenv.config();

const fastify = Fastify({ 
  logger: true,
  ajv: {
    customOptions: {
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: true,
      allErrors: true,
    }
  }
});

// Enable CORS for frontend requests
fastify.register(cors, {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    }
  };
});

// Simple root endpoint
fastify.get('/', async (request, reply) => {
  return { 
    message: 'API server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  };
});

// Register routes
fastify.register(compareRoutes);

const start = async () => {
  try {
    // Try port 8000 - maybe certain ports are blocked?
    await fastify.listen({ port: 8000, host: 'localhost' });
    console.log(`Server listening on port 8000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
