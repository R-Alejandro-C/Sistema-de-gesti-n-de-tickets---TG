import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tipos')
export class TicketType {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_tipo: number;

    @ApiProperty({ example: 'Incidencia' })
    @Column({ unique: true })
    nombre: string;

    @DeleteDateColumn()
    deletedAt: Date;
}
