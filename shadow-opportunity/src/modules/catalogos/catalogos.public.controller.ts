import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Controlador de catálogos PÚBLICO - sin autenticación.
 * Solo expone los endpoints de lectura necesarios para el formulario de ticket público.
 */
@ApiTags('Public')
@Controller('public')
export class CatalogosPublicController {
    constructor(private readonly service: CatalogosService) { }

    @Get('categorias')
    @ApiOperation({ summary: 'Listar categorías (sin autenticación - para ticket público)' })
    findAllCategories(@Query() pagination: PaginationDto) {
        return this.service.findAllCategories(pagination);
    }

    @Get('tipos')
    @ApiOperation({ summary: 'Listar tipos de ticket (sin autenticación - para ticket público)' })
    findAllTypes() {
        return this.service.findAllTypes();
    }

    @Get('locales')
    @ApiOperation({ summary: 'Listar locales (sin autenticación - para ticket público)' })
    findAllLocales(@Query() pagination: PaginationDto) {
        return this.service.findAllLocales(pagination);
    }

    @Get('areas')
    @ApiOperation({ summary: 'Listar áreas (sin autenticación - para ticket público)' })
    async findAllAreas(@Query('localId') localId?: string) {
        // Para el ticket público no necesitamos paginación compleja de áreas
        if (localId) {
            return this.service.getLocalAreas(Number(localId));
        }
        return this.service.findAllAreas(new PaginationDto());
    }

    @Get('tickets')
    @ApiOperation({ summary: 'Endpoint para crear ticket público (sin autenticación)' })
    getPublicInfo() {
        return { message: 'Endpoint de ticket público activo' };
    }

    @Get('areas/:id/categorias')
    @ApiOperation({ summary: 'Listar categorías de un área (público)' })
    getAreaCategories(@Param('id') id: string) {
        return this.service.getAreaCategories(+id);
    }

    @Get('subcategorias')
    @ApiOperation({ summary: 'Listar subcategorías (público)' })
    findAllSubCategories(@Query() pagination: PaginationDto) {
        return this.service.findAllSubCategories(pagination);
    }

    @Get('categorias/:id/subcategorias')
    @ApiOperation({ summary: 'Listar subcategorías de una categoría (público)' })
    getCategorySubCategories(@Param('id') id: string) {
        return this.service.getCategorySubCategories(+id);
    }
}
