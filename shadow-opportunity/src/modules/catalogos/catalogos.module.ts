import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogosService } from './catalogos.service';
import { CatalogosController } from './catalogos.controller';
import { CatalogosPublicController } from './catalogos.public.controller';
import { Area } from './entities/area.entity';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { TicketType } from './entities/ticket-type.entity';
import { Priority } from './entities/priority.entity';
import { TicketStatus } from './entities/ticket-status.entity';
import { Local } from './entities/local.entity';
import { LocalArea } from './entities/local-area.entity';
import { AreaCategory } from './entities/area-category.entity';
import { CategorySubCategory } from './entities/category-subcategory.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Local,
            Area,
            Category,
            SubCategory,
            TicketType,
            Priority,
            TicketStatus,
            LocalArea,
            AreaCategory,
            CategorySubCategory,
        ]),
    ],
    controllers: [CatalogosController, CatalogosPublicController],
    providers: [CatalogosService],
    exports: [CatalogosService, TypeOrmModule],
})
export class CatalogosModule { }
