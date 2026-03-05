import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './modules/seed/seed.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('SeedCLI');
    logger.log('Iniciando proceso de seeding manual...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const seedService = app.get(SeedService);

    try {
        await seedService.runSeed();
        logger.log('Seeding completado exitosamente.');
    } catch (error) {
        logger.error('Error durante el seeding:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
