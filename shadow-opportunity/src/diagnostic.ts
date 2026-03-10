import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CatalogosService } from './modules/catalogos/catalogos.service';
import { PaginationDto } from './common/dto/pagination.dto';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(CatalogosService);

    console.log('--- Probando findAllSubCategories ---');
    try {
        const res = await service.findAllSubCategories(new PaginationDto());
        console.log('Éxito:', JSON.stringify(res, null, 2).substring(0, 500) + '...');
    } catch (err) {
        console.error('ERROR en findAllSubCategories:', err);
    }

    console.log('\n--- Probando findAllCategories ---');
    try {
        const res = await service.findAllCategories(new PaginationDto());
        console.log('Éxito:', JSON.stringify(res, null, 2).substring(0, 500) + '...');
    } catch (err) {
        console.error('ERROR en findAllCategories:', err);
    }

    await app.close();
}
bootstrap();
