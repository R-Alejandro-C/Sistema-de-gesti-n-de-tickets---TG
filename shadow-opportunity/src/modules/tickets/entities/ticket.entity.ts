import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Local } from '../../catalogos/entities/local.entity';
import { Area } from '../../catalogos/entities/area.entity';
import { Category } from '../../catalogos/entities/category.entity';
import { SubCategory } from '../../catalogos/entities/sub-category.entity';
import { TicketType } from '../../catalogos/entities/ticket-type.entity';
import { Priority } from '../../catalogos/entities/priority.entity';
import { TicketStatus } from '../../catalogos/entities/ticket-status.entity';
import { History } from '../../history/entities/history.entity';

@Entity('tickets')
export class Ticket {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_ticket: number;

    @ApiProperty({ example: 1 })
    @Column()
    id_usuario_creador: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario_creador' })
    creador: User;

    @ApiProperty({ example: 2, nullable: true })
    @Column({ nullable: true })
    id_usuario_asignado: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'id_usuario_asignado' })
    asignado: User;

    @ApiProperty({ example: 1, nullable: true })
    @Column({ nullable: true })
    id_local: number;

    @ManyToOne(() => Local, { nullable: true })
    @JoinColumn({ name: 'id_local' })
    local: Local;

    @ApiProperty({ example: 1, nullable: true })
    @Column({ nullable: true })
    id_area: number;

    @ManyToOne(() => Area, { nullable: true })
    @JoinColumn({ name: 'id_area' })
    area: Area;

    @ApiProperty({ example: 1 })
    @Column()
    id_categoria: number;

    @ManyToOne(() => Category)
    @JoinColumn({ name: 'id_categoria' })
    categoria: Category;

    @ApiProperty({ example: 1, nullable: true })
    @Column({ nullable: true })
    id_subcategoria: number | null;

    @ManyToOne(() => SubCategory, { nullable: true })
    @JoinColumn({ name: 'id_subcategoria' })
    subcategoria: SubCategory;

    @ApiProperty({ example: 1 })
    @Column()
    id_tipo: number;

    @ManyToOne(() => TicketType)
    @JoinColumn({ name: 'id_tipo' })
    tipo: TicketType;

    @ApiProperty({ example: 2, nullable: true })
    @Column({ nullable: true })
    id_prioridad: number;

    @ManyToOne(() => Priority, { nullable: true })
    @JoinColumn({ name: 'id_prioridad' })
    prioridad: Priority;

    @ApiProperty({ example: 1 })
    @Column()
    id_estado: number;

    @ManyToOne(() => TicketStatus)
    @JoinColumn({ name: 'id_estado' })
    estado: TicketStatus;

    @ApiProperty({ example: 'No funciona el monitor' })
    @Column({ type: 'text' })
    detalle: string;

    @ApiProperty({ example: 'Se cambió el cable HDMI', nullable: true })
    @Column({ type: 'text', nullable: true })
    solucion_detalle: string;

    @ApiProperty()
    @CreateDateColumn({ type: 'timestamp' })
    fecha_creacion: Date;

    @ApiProperty({ nullable: true })
    @Column({ type: 'timestamp', nullable: true })
    fecha_cierre: Date;

    @OneToMany(() => History, (history) => history.ticket)
    historial: History[];

    @DeleteDateColumn()
    deletedAt: Date;

    @ApiProperty({ example: 3600000, description: 'Tiempo en ms' })
    get tiempo_resolucion_ms(): number | null {
        if (!this.fecha_cierre) return null;
        return this.fecha_cierre.getTime() - this.fecha_creacion.getTime();
    }
}
