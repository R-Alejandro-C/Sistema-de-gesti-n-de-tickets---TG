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
        ]),
    ],
    controllers: [CatalogosController, CatalogosPublicController],
    providers: [CatalogosService],
    exports: [CatalogosService, TypeOrmModule],
})
export class CatalogosModule { }
