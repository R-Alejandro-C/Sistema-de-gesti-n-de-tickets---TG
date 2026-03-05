import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Interceptor de logging global
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Prefijo global de la API
  app.setGlobalPrefix('api/v1');

  // Configuración de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Ticket Management System - API')
    .setDescription('Sistema profesional de gestión de tickets internos')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese su token JWT',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Autenticación y Sesión')
    .addTag('Users', 'Gestión de Usuarios')
    .addTag('Tickets', 'Operaciones de Tickets')
    .addTag('Catálogos - Áreas', 'Gestión de áreas de la organización')
    .addTag('Catálogos - Categorías', 'Gestión de categorías de servicios')
    .addTag('Catálogos - Subcategorías', 'Gestión de subcategorías detalladas')
    .addTag('Catálogos - Estados', 'Estados del flujo de vida de un ticket')
    .addTag('Catálogos - Prioridades', 'Prioridades y tiempos de respuesta (SLA)')
    .addTag('Catálogos - Tipos', 'Tipos de tickets admitidos')
    .addTag('Seeds', 'Inicialización de datos base')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Habilitar CORS
  app.enableCors();

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`Swagger documentation: http://localhost:${port}/docs`);
}
bootstrap();
