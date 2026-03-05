import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from './category.entity';
import { Local } from './local.entity';

@Entity('areas')
export class Area {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_area: number;

    @ApiProperty({ example: 'Soporte Técnico' })
    @Column({ unique: true })
    nombre: string;

    @ApiProperty({ example: 1 })
    @Column({ name: 'id_local', nullable: true })
    id_local: number;

    @ManyToOne(() => Local, (local) => local.areas, { nullable: true })
    @JoinColumn({ name: 'id_local' })
    local: Local;

    @OneToMany(() => Category, (category) => category.area)
    categorias: Category[];

    @DeleteDateColumn()
    deletedAt: Date;
}

