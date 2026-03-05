import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import { TicketStatus } from '../catalogos/entities/ticket-status.entity';
import { Priority } from '../catalogos/entities/priority.entity';
import { Role } from '../roles/entities/role.entity';
import { HistoryModule } from '../history/history.module';
import { EmailModule } from '../email/email.module';
import { Area } from '../catalogos/entities/area.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Ticket, User, TicketStatus, Priority, Role, Area]),
        HistoryModule,
        EmailModule,
    ],
    controllers: [TicketsController],
    providers: [TicketsService],
})
export class TicketsModule { }
