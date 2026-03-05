import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { User } from '../../users/entities/user.entity';

@Entity('historial')
export class History {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_historial: number;

    @ApiProperty({ example: 1 })
    @Column()
    id_ticket: number;

    @ManyToOne(() => Ticket, (ticket) => ticket.historial)
    @JoinColumn({ name: 'id_ticket' })
    ticket: Ticket;

    @ApiProperty({ example: 'id_estado' })
    @Column()
    campo_modificado: string;

    @ApiProperty({ example: '1', nullable: true })
    @Column({ type: 'text', nullable: true })
    valor_anterior: string;

    @ApiProperty({ example: '2' })
    @Column({ type: 'text', nullable: true })
    valor_nuevo: string;

    @ApiProperty({ example: 1 })
    @Column()
    id_usuario: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario' })
    usuario: User;

    @ApiProperty()
    @CreateDateColumn({ type: 'timestamp' })
    fecha_cambio: Date;

    @ApiProperty({ example: 'El técnico inició la revisión', nullable: true })
    @Column({ type: 'text', nullable: true })
    comentario: string;
}
