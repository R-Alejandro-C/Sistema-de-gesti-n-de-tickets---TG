import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Local } from './local.entity';
import { Area } from './area.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('local_areas')
@Unique(['id_local', 'id_area'])
export class LocalArea {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_local_area: number;

    @ApiProperty({ example: 1 })
    @Column()
    id_local: number;

    @ManyToOne(() => Local, (local) => local.localAreas)
    @JoinColumn({ name: 'id_local' })
    local: Local;

    @ApiProperty({ example: 1 })
    @Column()
    id_area: number;

    @ManyToOne(() => Area, (area) => area.localAreas)
    @JoinColumn({ name: 'id_area' })
    area: Area;

    @OneToMany(() => Ticket, (ticket) => ticket.localArea)
    tickets: Ticket[];
}
