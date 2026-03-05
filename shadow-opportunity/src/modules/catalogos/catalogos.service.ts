import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './entities/area.entity';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { TicketType } from './entities/ticket-type.entity';
import { TicketStatus } from './entities/ticket-status.entity';
import { Priority } from './entities/priority.entity';
import { Local } from './entities/local.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UpdateAreaDto, UpdateCategoryDto, UpdateSubCategoryDto, UpdateStatusDto, UpdatePriorityDto, UpdateTypeDto, CreatePriorityDto, CreateStatusDto, CreateTypeDto, CreateLocalDto, UpdateLocalDto } from './dto/catalogos.dto';

@Injectable()
export class CatalogosService {
    constructor(
        @InjectRepository(Local) private localRepo: Repository<Local>,
        @InjectRepository(Area) private areaRepo: Repository<Area>,
        @InjectRepository(Category) private catRepo: Repository<Category>,
        @InjectRepository(SubCategory) private subCatRepo: Repository<SubCategory>,
        @InjectRepository(TicketType) private typeRepo: Repository<TicketType>,
        @InjectRepository(TicketStatus) private statusRepo: Repository<TicketStatus>,
        @InjectRepository(Priority) private priorityRepo: Repository<Priority>,
    ) { }

    // --- LOCALES ---
    async createLocal(dto: CreateLocalDto) {
        return this.localRepo.save(this.localRepo.create(dto));
    }
    async findAllLocales(pagination: PaginationDto) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const [data, total] = await this.localRepo.findAndCount({
            relations: ['areas'],
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, lastPage: Math.ceil(total / limit) };
    }
    async findOneLocal(id: number) {
        const local = await this.localRepo.findOne({ where: { id_local: id }, relations: ['areas'] });
        if (!local) throw new NotFoundException('Local no encontrado');
        return local;
    }
    async updateLocal(id: number, dto: UpdateLocalDto) {
        const local = await this.findOneLocal(id);
        return this.localRepo.save({ ...local, ...dto });
    }
    async deleteLocal(id: number) {
        await this.findOneLocal(id);
        return this.localRepo.softDelete(id);
    }

    // --- AREAS ---
    async createArea(data: any) {
        return this.areaRepo.save(this.areaRepo.create(data));
    }
    async findAllAreas(pagination: PaginationDto, localId?: number) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;

        const whereClause = localId ? { local: { id_local: localId } } : {};

        const [data, total] = await this.areaRepo.findAndCount({
            where: whereClause,
            relations: ['local'],
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, lastPage: Math.ceil(total / limit) };
    }
    async updateArea(id: number, dto: UpdateAreaDto) {
        const area = await this.areaRepo.findOne({ where: { id_area: id } });
        if (!area) throw new NotFoundException('Area no encontrada');
        return this.areaRepo.save({ ...area, ...dto });
    }
    async deleteArea(id: number) {
        const area = await this.areaRepo.findOne({ where: { id_area: id } });
        if (!area) throw new NotFoundException('Area no encontrada');
        return this.areaRepo.softDelete(id);
    }

    // --- CATEGORIAS ---
    async createCategory(data: any) {
        return this.catRepo.save(this.catRepo.create(data));
    }
    async findAllCategories(pagination: PaginationDto) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const [data, total] = await this.catRepo.findAndCount({
            relations: ['area'],
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, lastPage: Math.ceil(total / limit) };
    }

    async findArchivedCategories() {
        return this.catRepo.createQueryBuilder('categoria')
            .withDeleted()
            .where('categoria.deletedAt IS NOT NULL')
            .getMany();
    }
    async updateCategory(id: number, dto: UpdateCategoryDto) {
        const cat = await this.catRepo.findOne({ where: { id_categoria: id } });
        if (!cat) throw new NotFoundException('Categoría no encontrada');
        return this.catRepo.save({ ...cat, ...dto });
    }
    async deleteCategory(id: number) {
        const cat = await this.catRepo.findOne({ where: { id_categoria: id } });
        if (!cat) throw new NotFoundException('Categoría no encontrada');
        return this.catRepo.softDelete(id);
    }

    async restoreCategory(id: number) {
        return this.catRepo.restore(id);
    }

    // --- SUBCATEGORIAS ---
    async createSubCategory(data: any) {
        return this.subCatRepo.save(this.subCatRepo.create(data));
    }
    async findAllSubCategories(pagination: PaginationDto) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const [data, total] = await this.subCatRepo.findAndCount({
            relations: ['categoria', 'categoria.area'],
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, lastPage: Math.ceil(total / limit) };
    }
    async updateSubCategory(id: number, dto: UpdateSubCategoryDto) {
        const subCat = await this.subCatRepo.findOne({ where: { id_subcategoria: id } });
        if (!subCat) throw new NotFoundException('Subcategoría no encontrada');
        return this.subCatRepo.save({ ...subCat, ...dto });
    }
    async deleteSubCategory(id: number) {
        const subCat = await this.subCatRepo.findOne({ where: { id_subcategoria: id } });
        if (!subCat) throw new NotFoundException('Subcategoría no encontrada');
        return this.subCatRepo.softDelete(id);
    }

    // --- ESTADOS ---
    async createStatus(dto: CreateStatusDto) {
        return this.statusRepo.save(this.statusRepo.create(dto));
    }
    async findAllStatuses() {
        return this.statusRepo.find();
    }
    async updateStatus(id: number, dto: UpdateStatusDto) {
        const status = await this.statusRepo.findOne({ where: { id_estado: id } });
        if (!status) throw new NotFoundException('Estado no encontrado');
        return this.statusRepo.save({ ...status, ...dto });
    }
    async deleteStatus(id: number) {
        const status = await this.statusRepo.findOne({ where: { id_estado: id } });
        if (!status) throw new NotFoundException('Estado no encontrado');
        return this.statusRepo.softDelete(id);
    }

    // --- PRIORIDADES ---
    async createPriority(dto: CreatePriorityDto) {
        return this.priorityRepo.save(this.priorityRepo.create(dto));
    }
    async findAllPriorities() {
        return this.priorityRepo.find();
    }
    async updatePriority(id: number, dto: UpdatePriorityDto) {
        const priority = await this.priorityRepo.findOne({ where: { id_prioridad: id } });
        if (!priority) throw new NotFoundException('Prioridad no encontrada');
        return this.priorityRepo.save({ ...priority, ...dto });
    }
    async deletePriority(id: number) {
        const priority = await this.priorityRepo.findOne({ where: { id_prioridad: id } });
        if (!priority) throw new NotFoundException('Prioridad no encontrada');
        return this.priorityRepo.softDelete(id);
    }

    // --- TIPOS ---
    async createType(dto: CreateTypeDto) {
        return this.typeRepo.save(this.typeRepo.create(dto));
    }
    async findAllTypes() {
        return this.typeRepo.find();
    }
    async updateType(id: number, dto: UpdateTypeDto) {
        const type = await this.typeRepo.findOne({ where: { id_tipo: id } });
        if (!type) throw new NotFoundException('Tipo no encontrado');
        return this.typeRepo.save({ ...type, ...dto });
    }
    async deleteType(id: number) {
        const type = await this.typeRepo.findOne({ where: { id_tipo: id } });
        if (!type) throw new NotFoundException('Tipo no encontrado');
        return this.typeRepo.softDelete(id);
    }
}

