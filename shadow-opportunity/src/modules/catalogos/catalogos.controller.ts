import { Controller, Get, Post, Body, Delete, Param, UseGuards, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';
import { CreateAreaDto, CreateCategoryDto, CreateSubCategoryDto, UpdateAreaDto, UpdateCategoryDto, UpdateSubCategoryDto, CreatePriorityDto, CreateStatusDto, CreateTypeDto, UpdatePriorityDto, UpdateStatusDto, UpdateTypeDto, CreateLocalDto, UpdateLocalDto } from './dto/catalogos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('catalogos')
export class CatalogosController {
    constructor(private readonly service: CatalogosService) { }

    // --- LOCALES ---
    @ApiTags('Catálogos - Locales')
    @Post('locales')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Crear nuevo local' })
    createLocal(@Body() dto: CreateLocalDto) {
        return this.service.createLocal(dto);
    }

    @ApiTags('Catálogos - Locales')
    @Get('locales')
    @ApiOperation({ summary: 'Listar locales con sus áreas' })
    findAllLocales(@Query() pagination: PaginationDto) {
        return this.service.findAllLocales(pagination);
    }

    @ApiTags('Catálogos - Locales')
    @Get('locales/:id')
    @ApiOperation({ summary: 'Obtener un local por ID' })
    findOneLocal(@Param('id') id: string) {
        return this.service.findOneLocal(+id);
    }

    @ApiTags('Catálogos - Locales')
    @Patch('locales/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Actualizar local' })
    updateLocal(@Param('id') id: string, @Body() dto: UpdateLocalDto) {
        return this.service.updateLocal(+id, dto);
    }

    @ApiTags('Catálogos - Locales')
    @Delete('locales/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Soft delete de local' })
    deleteLocal(@Param('id') id: string) {
        return this.service.deleteLocal(+id);
    }

    @ApiTags('Catálogos - Locales')
    @Get('locales/:id/areas')
    @ApiOperation({ summary: 'Listar áreas asignadas a un local' })
    getLocalAreas(@Param('id') id: string) {
        return this.service.getLocalAreas(+id);
    }

    // --- AREAS ---
    @ApiTags('Catálogos - Áreas')
    @Post('areas')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Crear nueva área' })
    createArea(@Body() dto: CreateAreaDto) {
        return this.service.createArea(dto);
    }

    @ApiTags('Catálogos - Áreas')
    @Get('areas')
    @ApiOperation({ summary: 'Listar áreas con paginación' })
    findAllAreas(@Query() pagination: PaginationDto, @Query('id_local') id_local?: number) {
        return this.service.findAllAreas(pagination, id_local);
    }

    @ApiTags('Catálogos - Áreas')
    @Patch('areas/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Actualizar área' })
    updateArea(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
        return this.service.updateArea(+id, dto);
    }

    @ApiTags('Catálogos - Áreas')
    @Delete('areas/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Soft delete de área' })
    deleteArea(@Param('id') id: string) {
        return this.service.deleteArea(+id);
    }

    @ApiTags('Catálogos - Áreas')
    @Get('areas/:id/categorias')
    @ApiOperation({ summary: 'Listar categorías asignadas a un área' })
    getAreaCategories(@Param('id') id: string) {
        return this.service.getAreaCategories(+id);
    }

    // --- CATEGORIAS ---
    @ApiTags('Catálogos - Categorías')
    @Post('categorias')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Crear nueva categoría' })
    createCategory(@Body() dto: CreateCategoryDto) {
        return this.service.createCategory(dto);
    }

    @ApiTags('Catálogos - Categorías')
    @Get('categorias')
    @ApiOperation({ summary: 'Listar categorías' })
    findAllCategories(@Query() pagination: PaginationDto) {
        return this.service.findAllCategories(pagination);
    }

    @ApiTags('Catálogos - Categorías')
    @Get('categorias/archived')
    @Roles('ADMIN', 'SOPORTE')
    @ApiOperation({ summary: 'Listar categorías archivadas (Soft Delete)' })
    findArchivedCategories() {
        return this.service.findArchivedCategories();
    }

    @ApiTags('Catálogos - Categorías')
    @Patch('categorias/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Actualizar categoría' })
    updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.service.updateCategory(+id, dto);
    }

    @ApiTags('Catálogos - Categorías')
    @Delete('categorias/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Soft delete de categoría' })
    deleteCategory(@Param('id') id: string) {
        return this.service.deleteCategory(+id);
    }

    @ApiTags('Catálogos - Categorías')
    @Patch('categorias/:id/restore')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Restaurar categoría archivada' })
    restoreCategory(@Param('id') id: string) {
        return this.service.restoreCategory(+id);
    }

    @ApiTags('Catálogos - Categorías')
    @Get('categorias/:id/subcategorias')
    @ApiOperation({ summary: 'Listar subcategorías de una categoría' })
    getCategorySubCategories(@Param('id') id: string) {
        return this.service.getCategorySubCategories(+id);
    }

    // --- SUBCATEGORIAS ---
    @ApiTags('Catálogos - Subcategorías')
    @Post('subcategorias')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Crear nueva subcategoría' })
    createSubCategory(@Body() dto: CreateSubCategoryDto) {
        return this.service.createSubCategory(dto);
    }

    @ApiTags('Catálogos - Subcategorías')
    @Get('subcategorias')
    @ApiOperation({ summary: 'Listar subcategorías' })
    findAllSubCategories(@Query() pagination: PaginationDto) {
        return this.service.findAllSubCategories(pagination);
    }

    @ApiTags('Catálogos - Subcategorías')
    @Patch('subcategorias/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Actualizar subcategoría' })
    updateSubCategory(@Param('id') id: string, @Body() dto: UpdateSubCategoryDto) {
        return this.service.updateSubCategory(+id, dto);
    }

    @ApiTags('Catálogos - Subcategorías')
    @Delete('subcategorias/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Soft delete de subcategoría' })
    deleteSubCategory(@Param('id') id: string) {
        return this.service.deleteSubCategory(+id);
    }

    // --- ESTADOS ---
    @ApiTags('Catálogos - Estados')
    @Post('estados')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Crear nuevo estado' })
    createStatus(@Body() dto: CreateStatusDto) {
        return this.service.createStatus(dto);
    }

    @ApiTags('Catálogos - Estados')
    @Get('estados')
    @ApiOperation({ summary: 'Listar estados' })
    findAllStatuses() {
        return this.service.findAllStatuses();
    }

    @ApiTags('Catálogos - Estados')
    @Patch('estados/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Actualizar estado' })
    updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
        return this.service.updateStatus(+id, dto);
    }

    @ApiTags('Catálogos - Estados')
    @Delete('estados/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Soft delete de estado' })
    deleteStatus(@Param('id') id: string) {
        return this.service.deleteStatus(+id);
    }

    // --- PRIORIDADES ---
    @ApiTags('Catálogos - Prioridades')
    @Post('prioridades')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Crear nueva prioridad' })
    createPriority(@Body() dto: CreatePriorityDto) {
        return this.service.createPriority(dto);
    }

    @ApiTags('Catálogos - Prioridades')
    @Get('prioridades')
    @ApiOperation({ summary: 'Listar prioridades' })
    findAllPriorities() {
        return this.service.findAllPriorities();
    }

    @ApiTags('Catálogos - Prioridades')
    @Patch('prioridades/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Actualizar prioridad' })
    updatePriority(@Param('id') id: string, @Body() dto: UpdatePriorityDto) {
        return this.service.updatePriority(+id, dto);
    }

    @ApiTags('Catálogos - Prioridades')
    @Delete('prioridades/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Soft delete de prioridad' })
    deletePriority(@Param('id') id: string) {
        return this.service.deletePriority(+id);
    }

    // --- TIPOS ---
    @ApiTags('Catálogos - Tipos')
    @Post('tipos')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Crear nuevo tipo' })
    createType(@Body() dto: CreateTypeDto) {
        return this.service.createType(dto);
    }

    @ApiTags('Catálogos - Tipos')
    @Get('tipos')
    @ApiOperation({ summary: 'Listar tipos de ticket' })
    findAllTypes() {
        return this.service.findAllTypes();
    }

    @ApiTags('Catálogos - Tipos')
    @Patch('tipos/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Actualizar tipo' })
    updateType(@Param('id') id: string, @Body() dto: UpdateTypeDto) {
        return this.service.updateType(+id, dto);
    }

    @ApiTags('Catálogos - Tipos')
    @Delete('tipos/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Soft delete de tipo' })
    deleteType(@Param('id') id: string) {
        return this.service.deleteType(+id);
    }
}


