import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Area } from './entities/area.entity';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { TicketType } from './entities/ticket-type.entity';
import { TicketStatus } from './entities/ticket-status.entity';
import { Priority } from './entities/priority.entity';
import { Local } from './entities/local.entity';
import { AreaCategory } from './entities/area-category.entity';
import { CategorySubCategory } from './entities/category-subcategory.entity';
import { LocalArea } from './entities/local-area.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
    UpdateAreaDto,
    UpdateCategoryDto,
    UpdateSubCategoryDto,
    UpdateStatusDto,
    UpdatePriorityDto,
    UpdateTypeDto,
    CreatePriorityDto,
    CreateStatusDto,
    CreateTypeDto,
    CreateLocalDto,
    UpdateLocalDto,
    CreateAreaDto,
    CreateCategoryDto,
    CreateSubCategoryDto
} from './dto/catalogos.dto';

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
        @InjectRepository(LocalArea) private localAreaRepo: Repository<LocalArea>,
        @InjectRepository(AreaCategory) private areaCategoryRepo: Repository<AreaCategory>,
        @InjectRepository(CategorySubCategory) private categorySubCategoryRepo: Repository<CategorySubCategory>,
    ) { }

    // --- LOCALES ---
    async createLocal(dto: CreateLocalDto) {
        return this.localRepo.save(this.localRepo.create(dto));
    }
    async findAllLocales(pagination: PaginationDto) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const [data, total] = await this.localRepo.findAndCount({
            relations: ['localAreas', 'localAreas.area'],
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, lastPage: Math.ceil(total / limit) };
    }
    async findOneLocal(id: number) {
        const local = await this.localRepo.findOne({ where: { id_local: id }, relations: ['localAreas', 'localAreas.area'] });
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
    async createArea(dto: CreateAreaDto) {
        const { nombre, id_local } = dto;
        let area = await this.areaRepo.findOne({ where: { nombre } });
        if (!area) {
            area = await this.areaRepo.save(this.areaRepo.create({ nombre }));
        }

        if (id_local) {
            await this.assignAreaToLocal(id_local, area.id_area);
        }

        return area;
    }

    async assignAreaToLocal(id_local: number, id_area: number) {
        const exists = await this.localAreaRepo.findOne({ where: { id_local, id_area } });
        if (!exists) {
            return this.localAreaRepo.save({ id_local, id_area });
        }
        return exists;
    }

    async getLocalAreas(localId: number) {
        return this.localAreaRepo.find({
            where: { id_local: localId },
            relations: ['area'],
        });
    }

    async findAllAreas(pagination: PaginationDto, localId?: number) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;

        const query = this.areaRepo.createQueryBuilder('area')
            .leftJoinAndSelect('area.localAreas', 'localArea')
            .leftJoinAndSelect('localArea.local', 'local');

        if (localId) {
            query.andWhere('localArea.id_local = :localId', { localId });
        }

        const [data, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total, page, lastPage: Math.ceil(total / limit) };
    }
    async updateArea(id: number, dto: UpdateAreaDto) {
        const area = await this.areaRepo.findOne({ where: { id_area: id } });
        if (!area) throw new NotFoundException('Area no encontrada');

        const { id_local, ...data } = dto;

        if (id_local) {
            await this.assignAreaToLocal(id_local, id);
        }

        return this.areaRepo.save({ ...area, ...data });
    }
    async deleteArea(id: number) {
        const area = await this.areaRepo.findOne({ where: { id_area: id } });
        if (!area) throw new NotFoundException('Area no encontrada');
        return this.areaRepo.softDelete(id);
    }

    // --- CATEGORIAS ---
    async createCategory(dto: CreateCategoryDto) {
        const { nombre, id_area } = dto;
        let cat = await this.catRepo.findOne({ where: { nombre } });
        if (!cat) {
            cat = await this.catRepo.save(this.catRepo.create({ nombre }));
        }

        if (id_area) {
            await this.assignCategoryToArea(id_area, cat.id_categoria);
        }

        return cat;
    }

    async assignCategoryToArea(id_area: number, id_categoria: number) {
        const exists = await this.areaCategoryRepo.findOne({ where: { id_area, id_categoria } });
        if (!exists) {
            return this.areaCategoryRepo.save({ id_area, id_categoria });
        }
        return exists;
    }

    async assignSubCategoryToCategory(categoryId: number, subCategoryId: number) {
        const exists = await this.categorySubCategoryRepo.findOne({
            where: { id_categoria: categoryId, id_subcategoria: subCategoryId }
        });
        if (!exists) {
            await this.categorySubCategoryRepo.save(
                this.categorySubCategoryRepo.create({ id_categoria: categoryId, id_subcategoria: subCategoryId })
            );
        }
    }

    async getAreaCategories(areaId: number) {
        return this.areaCategoryRepo.find({
            where: { id_area: areaId },
            relations: ['categoria'],
        });
    }

    async findAllCategories(pagination: PaginationDto) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const [data, total] = await this.catRepo.findAndCount({
            relations: {
                areaCategories: {
                    area: true
                }
            },
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

        const { id_area, ...data } = dto;

        if (id_area) {
            await this.assignCategoryToArea(id_area, id);
        }

        return this.catRepo.save({ ...cat, ...data });
    }

    async deleteCategory(id: number) {
        const cat = await this.catRepo.findOne({ where: { id_categoria: id } });
        if (!cat) throw new NotFoundException('Categoría no encontrada');
        return this.catRepo.softDelete(id);
    }

    async restoreCategory(id: number) {
        return this.catRepo.restore(id);
    }

    async getCategorySubCategories(catId: number) {
        return this.categorySubCategoryRepo.find({
            where: { id_categoria: catId },
            relations: ['subCategory'],
        });
    }

    // --- SUBCATEGORIAS ---
    async createSubCategory(dto: CreateSubCategoryDto) {
        const { id_categoria, ...data } = dto;
        const subCat = await this.subCatRepo.save(this.subCatRepo.create(data));

        if (id_categoria) {
            await this.assignSubCategoryToCategory(id_categoria, subCat.id_subcategoria);
        }

        return subCat;
    }

    async findAllSubCategories(pagination: PaginationDto) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;

        const [data, total] = await this.subCatRepo.findAndCount({
            relations: {
                categorySubCategories: {
                    category: {
                        areaCategories: {
                            area: true
                        }
                    }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { data, total, page, lastPage: Math.ceil(total / limit) };
    }

    async updateSubCategory(id: number, dto: UpdateSubCategoryDto) {
        const subCat = await this.subCatRepo.findOne({ where: { id_subcategoria: id } });
        if (!subCat) throw new NotFoundException('Subcategoría no encontrada');

        const { id_categoria, ...data } = dto;

        if (id_categoria) {
            await this.assignSubCategoryToCategory(id_categoria, id);
        }

        return this.subCatRepo.save({ ...subCat, ...data });
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
