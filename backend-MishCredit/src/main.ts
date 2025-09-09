import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix - THIS IS IMPORTANT
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://127.0.0.1:3000', 
      'http://localhost:4000', 
      'http://127.0.0.1:4000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-HAWAII-AUTH'],
    credentials: true,
  });

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Backend running on http://localhost:${port}`);
  logger.log(`📋 Endpoints available at:`);
  logger.log(`   - http://localhost:${port}/api/health`);
  logger.log(`   - http://localhost:${port}/api/proxy/login`);
  logger.log(`   - http://localhost:${port}/api/proxy/malla`);
  logger.log(`   - http://localhost:${port}/api/proxy/avance`);
}

bootstrap();