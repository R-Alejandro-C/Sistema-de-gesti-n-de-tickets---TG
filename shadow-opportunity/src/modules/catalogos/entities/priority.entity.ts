import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('prioridades')
export class Priority {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_prioridad: number;

    @ApiProperty({ example: 'Alta' })
    @Column({ unique: true })
    nombre: string;

    @ApiProperty({ example: 4, description: 'SLA en horas' })
    @Column({ type: 'int' })
    sla_horas: number;

    @DeleteDateColumn()
    deletedAt: Date;
}
