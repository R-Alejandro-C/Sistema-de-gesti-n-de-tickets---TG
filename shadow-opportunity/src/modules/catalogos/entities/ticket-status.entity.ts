import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('estados')
export class TicketStatus {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_estado: number;

    @ApiProperty({ example: 'En Proceso' })
    @Column({ unique: true })
    nombre: string;

    @DeleteDateColumn()
    deletedAt: Date;
}
