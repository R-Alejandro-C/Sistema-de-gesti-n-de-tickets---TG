import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';
import { User } from '../users/entities/user.entity';
import { TicketStatus } from '../catalogos/entities/ticket-status.entity';
import { Priority } from '../catalogos/entities/priority.entity';
import { Role } from '../roles/entities/role.entity';
import { History } from '../history/entities/history.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EmailService } from '../email/email.service';
import { Area } from '../catalogos/entities/area.entity';

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(TicketStatus) private statusRepo: Repository<TicketStatus>,
        @InjectRepository(Priority) private priorityRepo: Repository<Priority>,
        @InjectRepository(Role) private roleRepo: Repository<Role>,
        @InjectRepository(Area) private areaRepo: Repository<Area>,
        private dataSource: DataSource,
        private emailService: EmailService,
    ) { }

    private applyDateFilters(query: any, startDate?: string, endDate?: string) {
        if (startDate) {
            query.andWhere('ticket.fecha_creacion >= :startDate', { startDate: new Date(startDate) });
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.andWhere('ticket.fecha_creacion <= :endDate', { endDate: end });
        }
        return query;
    }

    async create(dto: CreateTicketDto, authUser?: any): Promise<Ticket> {
        let user: User;

        if (authUser) {
            user = (await this.userRepo.findOne({ where: { id_usuario: authUser.userId } })) as User;
            if (!user) throw new Error('Usuario autenticado no encontrado');
        } else if (dto.mail_solicitante) {
            user = (await this.userRepo.findOne({ where: { email: dto.mail_solicitante } })) as User;
            if (!user) {
                const solRole = await this.roleRepo.findOne({ where: { nombre: 'SOLICITANTE' } });
                user = await this.userRepo.save(this.userRepo.create({
                    nombre: dto.nombre_solicitante || dto.mail_solicitante.split('@')[0],
                    email: dto.mail_solicitante,
                    id_rol: solRole?.id_rol,
                    activo: true,
                }));
            }
        } else if (dto.nombre_solicitante) {
            const solRole = await this.roleRepo.findOne({ where: { nombre: 'SOLICITANTE' } });
            const fakeEmail = `${dto.nombre_solicitante.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@publico.local`;
            user = await this.userRepo.save(this.userRepo.create({
                nombre: dto.nombre_solicitante,
                email: fakeEmail,
                id_rol: solRole?.id_rol,
                activo: true,
            }));
        } else {
            throw new Error('Se requiere usuario autenticado o nombre del solicitante');
        }

        const regStatus = await this.statusRepo.findOne({ where: { nombre: 'Registrado' } });
        if (!regStatus) throw new Error('Estado "Registrado" no encontrado');

        // Validar coherencia Area-Local
        const area = await this.areaRepo.findOne({
            where: { id_area: dto.id_area, id_local: dto.id_local }
        });
        if (!area) throw new Error('El área no coincide con el local seleccionado');

        const ticket = this.ticketRepo.create({
            ...dto,
            id_usuario_creador: user.id_usuario,
            id_estado: regStatus.id_estado,
            fecha_creacion: new Date(),
        });

        return this.ticketRepo.save(ticket);
    }

    async findAll(pagination: PaginationDto, user: any) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;

        const query = this.ticketRepo.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.creador', 'creador')
            .leftJoinAndSelect('ticket.asignado', 'asignado')
            .leftJoinAndSelect('ticket.estado', 'estado')
            .leftJoinAndSelect('ticket.prioridad', 'prioridad');

        if (user) {
            const isSolicitante = user.role === 'SOLICITANTE';
            if (pagination.owner === true || isSolicitante) {
                if (isSolicitante) {
                    query.andWhere('ticket.id_usuario_creador = :uid', { uid: user.userId });
                } else {
                    query.andWhere('ticket.id_usuario_asignado = :uid', { uid: user.userId });
                }
            }
        }

        if (pagination.id_estado) query.andWhere('ticket.id_estado = :estadoId', { estadoId: pagination.id_estado });

        if (pagination.search) {
            query.andWhere(
                '(ticket.detalle ILIKE :search OR creador.nombre ILIKE :search OR CAST(ticket.id_ticket AS TEXT) LIKE :search)',
                { search: `%${pagination.search}%` }
            );
        }

        this.applyDateFilters(query, pagination.startDate, pagination.endDate);

        const [data, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('ticket.fecha_creacion', 'DESC')
            .getManyAndCount();

        return { data, total, page, lastPage: Math.ceil(total / limit) };
    }

    async findOne(id: number, user: any): Promise<Ticket> {
        const ticket = await this.ticketRepo.findOne({
            where: { id_ticket: id },
            relations: ['creador', 'asignado', 'categoria', 'subcategoria', 'tipo', 'prioridad', 'estado', 'historial'],
        });
        if (!ticket) throw new NotFoundException('Ticket no encontrado');
        if (user && user.role === 'SOLICITANTE' && ticket.id_usuario_creador !== user.userId) {
            throw new ForbiddenException('No tienes acceso a este ticket');
        }
        return ticket;
    }

    async update(id: number, dto: UpdateTicketDto, userId: number): Promise<Ticket> {
        const ticket = await this.ticketRepo.findOne({ where: { id_ticket: id } });
        if (!ticket) throw new NotFoundException('Ticket no encontrado');

        const oldStatusId = ticket.id_estado;
        const oldAsignadoId = ticket.id_usuario_asignado;
        const oldPrioridadId = ticket.id_prioridad;
        const oldSubCatId = ticket.id_subcategoria;
        const oldCatId = ticket.id_categoria;

        const resultTransaction = await this.dataSource.transaction(async (manager: EntityManager) => {
            if (dto.id_usuario_asignado !== undefined) { ticket.id_usuario_asignado = dto.id_usuario_asignado; delete (ticket as any).asignado; }
            if (dto.id_prioridad !== undefined) { ticket.id_prioridad = dto.id_prioridad; delete (ticket as any).prioridad; }
            if (dto.id_categoria !== undefined) { ticket.id_categoria = dto.id_categoria; delete (ticket as any).categoria; }
            if (dto.id_subcategoria !== undefined) { ticket.id_subcategoria = dto.id_subcategoria; delete (ticket as any).subcategoria; }
            if (dto.id_estado) {
                ticket.id_estado = dto.id_estado;
                delete (ticket as any).estado;
                const newStatus = await manager.findOne(TicketStatus, { where: { id_estado: dto.id_estado } });
                if (newStatus && (newStatus.nombre === 'Cerrado' || newStatus.nombre === 'Resuelto')) {
                    ticket.fecha_cierre = new Date();
                }
            }
            if (dto.solucion_detalle) ticket.solucion_detalle = dto.solucion_detalle;

            const updated = await manager.save(ticket);

            // Log Historial
            const fields: Record<string, [any, any]> = {
                'Estado': [oldStatusId, updated.id_estado],
                'Asignación': [oldAsignadoId, updated.id_usuario_asignado],
                'Prioridad': [oldPrioridadId, updated.id_prioridad],
                'Categoría': [oldCatId, updated.id_categoria],
                'Subcategoría': [oldSubCatId, updated.id_subcategoria]
            };

            for (const [field, values] of Object.entries(fields)) {
                if (values[0] !== values[1]) {
                    await this.logChange(updated.id_ticket, field, values[0], values[1], userId, dto.comentario_historial || '', manager);
                }
            }

            return updated;
        });

        // Email Trigger
        if (dto.id_estado && dto.id_estado !== oldStatusId) {
            const newStatus = await this.statusRepo.findOne({ where: { id_estado: dto.id_estado } });
            if (newStatus?.nombre === 'Resuelto') {
                const refreshed = await this.ticketRepo.findOne({ where: { id_ticket: id }, relations: ['creador', 'asignado', 'categoria'] });
                if (refreshed) this.emailService.sendTicketResolvedEmail(refreshed);
            }
        }

        return resultTransaction;
    }

    private async logChange(ticketId: number, field: string, oldVal: any, newVal: any, userId: number, comment: string, manager: EntityManager) {
        const h = new History();
        h.id_ticket = ticketId;
        h.campo_modificado = field;
        h.valor_anterior = String(oldVal || 'N/A');
        h.valor_nuevo = String(newVal || 'N/A');
        h.id_usuario = userId;
        h.comentario = comment || `Cambio de ${field}`;
        await manager.save(h);
    }

    async getMetricsOverview(startDate?: string, endDate?: string) {
        const baseQuery = this.ticketRepo.createQueryBuilder('ticket');
        this.applyDateFilters(baseQuery, startDate, endDate);

        const stats = await baseQuery
            .select('COUNT(*)', 'total')
            .addSelect("COUNT(*) FILTER (WHERE estado.nombre = 'Registrado')", 'abiertos')
            .addSelect("COUNT(*) FILTER (WHERE estado.nombre = 'En Proceso')", 'en_proceso')
            .addSelect("COUNT(*) FILTER (WHERE estado.nombre = 'Resuelto')", 'resueltos')
            .addSelect("COUNT(*) FILTER (WHERE estado.nombre = 'Cerrado')", 'cerrados')
            .innerJoin('ticket.estado', 'estado')
            .getRawOne();

        const mttrResult = await baseQuery
            .select('AVG(EXTRACT(EPOCH FROM (ticket.fecha_cierre - ticket.fecha_creacion)))', 'avg_seconds')
            .andWhere('ticket.fecha_cierre IS NOT NULL')
            .innerJoin('ticket.estado', 'estado_mttr')
            .andWhere("estado_mttr.nombre IN ('Resuelto', 'Cerrado')")
            .getRawOne();

        const total = parseInt(stats.total) || 0;
        const resueltos = parseInt(stats.resueltos) || 0;
        const cerrados = parseInt(stats.cerrados) || 0;

        return {
            total_tickets: total,
            tickets_abiertos: parseInt(stats.abiertos) || 0,
            tickets_en_proceso: parseInt(stats.en_proceso) || 0,
            tickets_resueltos: resueltos,
            tickets_cerrados: cerrados,
            mttr_promedio_horas: mttrResult.avg_seconds ? (parseFloat(mttrResult.avg_seconds) / 3600).toFixed(2) : "0.00",
            sla_cumplimiento_estimado: total > 0 ? `${(((resueltos + cerrados) / total) * 100).toFixed(1)}%` : "0%"
        };
    }

    async getTicketsByStatus(startDate?: string, endDate?: string) {
        const query = this.ticketRepo.createQueryBuilder('ticket')
            .select('status.nombre', 'estado').addSelect('COUNT(*)', 'total')
            .leftJoin('ticket.estado', 'status');
        return this.applyDateFilters(query, startDate, endDate).groupBy('status.nombre').getRawMany();
    }

    async getTicketsByCategory(startDate?: string, endDate?: string) {
        const query = this.ticketRepo.createQueryBuilder('ticket')
            .select('categoria.nombre', 'categoria').addSelect('COUNT(*)', 'total')
            .leftJoin('ticket.categoria', 'categoria');
        return this.applyDateFilters(query, startDate, endDate).groupBy('categoria.nombre').getRawMany();
    }

    async getTicketsByArea(startDate?: string, endDate?: string) {
        const query = this.ticketRepo.createQueryBuilder('ticket')
            .select('area.nombre', 'area').addSelect('COUNT(*)', 'total')
            .leftJoin('ticket.area', 'area');
        return this.applyDateFilters(query, startDate, endDate).groupBy('area.nombre').getRawMany();
    }

    async getTicketsByLocal(startDate?: string, endDate?: string) {
        const query = this.ticketRepo.createQueryBuilder('ticket')
            .select('local.nombre', 'local').addSelect('COUNT(*)', 'total')
            .leftJoin('ticket.local', 'local');
        return this.applyDateFilters(query, startDate, endDate).groupBy('local.nombre').getRawMany();
    }

    async getTicketsByPriority(startDate?: string, endDate?: string) {
        const query = this.ticketRepo.createQueryBuilder('ticket')
            .select('prioridad.nombre', 'prioridad').addSelect('COUNT(*)', 'total')
            .leftJoin('ticket.prioridad', 'prioridad');
        return this.applyDateFilters(query, startDate, endDate).groupBy('prioridad.nombre').getRawMany();
    }

    async getAgentPerformance(startDate?: string, endDate?: string) {
        const query = this.ticketRepo.createQueryBuilder('ticket')
            .select('asignado.nombre', 'agente')
            .addSelect('COUNT(*)', 'total_asignados')
            .addSelect("COUNT(*) FILTER (WHERE estado.nombre IN ('Resuelto', 'Cerrado'))", 'total_resueltos')
            .addSelect('AVG(EXTRACT(EPOCH FROM (ticket.fecha_cierre - ticket.fecha_creacion))) FILTER (WHERE ticket.fecha_cierre IS NOT NULL)', 'avg_seconds')
            .leftJoin('ticket.asignado', 'asignado').innerJoin('ticket.estado', 'estado')
            .where('ticket.id_usuario_asignado IS NOT NULL');

        const results = await this.applyDateFilters(query, startDate, endDate)
            .groupBy('asignado.nombre').orderBy('total_resueltos', 'DESC').getRawMany();

        return results.map(r => ({
            agente: r.agente,
            total_asignados: parseInt(r.total_asignados),
            total_resueltos: parseInt(r.total_resueltos),
            mttr_horas: r.avg_seconds ? (parseFloat(r.avg_seconds) / 3600).toFixed(2) : "0.00",
            efectividad: r.total_asignados > 0 ? `${((parseInt(r.total_resueltos) / parseInt(r.total_asignados)) * 100).toFixed(1)}%` : "0%"
        }));
    }
}
