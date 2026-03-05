import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { TicketStatus } from '../catalogos/entities/ticket-status.entity';
import { TicketType } from '../catalogos/entities/ticket-type.entity';
import { Priority } from '../catalogos/entities/priority.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role, TicketStatus, TicketType, Priority]),
    ],
    controllers: [SeedController],
    providers: [SeedService],
})
export class SeedModule { }
