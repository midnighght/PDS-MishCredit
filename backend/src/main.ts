// arranque nest con cors, helmet y swagger opcional sin acentos ni punto final
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );
  // cors con origenes permitidos separados por coma en ALLOWED_ORIGINS
  // por defecto restringe a frontend local
  const originsRaw = process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173';
  const origins = originsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins, credentials: true });
  app.use(helmet());
  app.use(json({ limit: process.env.BODY_LIMIT || '1mb' }));
  app.use(
    urlencoded({ extended: true, limit: process.env.BODY_LIMIT || '1mb' }),
  );
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(
    '/api/ucn',
    rateLimit({
      windowMs: 60 * 1000,
      limit: 60,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // swagger solo en dev o si SWAGGER_ENABLED=true
  if (
    process.env.SWAGGER_ENABLED === 'true' ||
    process.env.NODE_ENV !== 'production'
  ) {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
    try {
      const swagger = require('@nestjs/swagger');
      const config = new swagger.DocumentBuilder()
        .setTitle('Planificador UCN')
        .setDescription('API para proyecciones y oferta')
        .setVersion('1.0')
        .addTag('health')
        .addTag('ucn')
        .addTag('oferta')
        .addTag('proyecciones')
        .build();
      const document = swagger.SwaggerModule.createDocument(app, config);
      swagger.SwaggerModule.setup('api/docs', app, document);
      console.log('swagger listo en /api/docs');
    } catch (_e) {
      console.log('swagger no instalado, se omite configuracion');
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
  }

  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
