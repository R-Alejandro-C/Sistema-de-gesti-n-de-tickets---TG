import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { TicketStatus } from '../catalogos/entities/ticket-status.entity';
import { TicketType } from '../catalogos/entities/ticket-type.entity';
import { Priority } from '../catalogos/entities/priority.entity';

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(TicketStatus) private readonly statusRepo: Repository<TicketStatus>,
        @InjectRepository(TicketType) private readonly typeRepo: Repository<TicketType>,
        @InjectRepository(Priority) private readonly priorityRepo: Repository<Priority>,
    ) { }

    async runSeed() {
        this.logger.log('Starting seed...');

        // 1. Roles
        const roles = ['ADMIN', 'SOPORTE', 'SOLICITANTE'];
        for (const roleName of roles) {
            const exists = await this.roleRepo.findOne({ where: { nombre: roleName } });
            if (!exists) {
                await this.roleRepo.save({ nombre: roleName });
            }
        }

        // 2. Estados
        const estados = ['Registrado', 'Asignado', 'En Proceso', 'Resuelto', 'Cerrado'];
        for (const statusName of estados) {
            const exists = await this.statusRepo.findOne({ where: { nombre: statusName } });
            if (!exists) {
                await this.statusRepo.save({ nombre: statusName });
            }
        }

        // 3. Tipos
        const tipos = ['Incidencia', 'Requerimiento'];
        for (const typeName of tipos) {
            const exists = await this.typeRepo.findOne({ where: { nombre: typeName } });
            if (!exists) {
                await this.typeRepo.save({ nombre: typeName });
            }
        }

        // 4. Prioridades
        const priorities = [
            { nombre: 'Baja', sla_horas: 24 },
            { nombre: 'Media', sla_horas: 8 },
            { nombre: 'Alta', sla_horas: 4 },
        ];
        for (const p of priorities) {
            const exists = await this.priorityRepo.findOne({ where: { nombre: p.nombre } });
            if (!exists) {
                await this.priorityRepo.save(p);
            }
        }

        // 5. Usuario Admin por defecto
        const adminEmail = 'admin@local.com';
        const adminExists = await this.userRepo.findOne({ where: { email: adminEmail } });
        if (!adminExists) {
            const adminRole = await this.roleRepo.findOne({ where: { nombre: 'ADMIN' } });
            if (adminRole) {
                const hash = await bcrypt.hash('Admin123', 10);
                await this.userRepo.save({
                    nombre: 'Admin System',
                    email: adminEmail,
                    pass_hash: hash,
                    id_rol: adminRole.id_rol,
                    activo: true,
                });
            }
        }

        this.logger.log('Seed completed successfully');
        return { status: 'Success', message: 'Seeds executed' };
    }
}
