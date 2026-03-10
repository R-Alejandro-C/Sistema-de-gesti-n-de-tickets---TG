import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { LocalArea } from './local-area.entity';
import { AreaCategory } from './area-category.entity';

@Entity('areas')
export class Area {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_area: number;

    @ApiProperty({ example: 'Soporte Técnico' })
    @Column({ unique: true })
    nombre: string;

    @OneToMany(() => LocalArea, (localArea) => localArea.area)
    localAreas: LocalArea[];

    @OneToMany(() => AreaCategory, (areaCategory) => areaCategory.area)
    areaCategories: AreaCategory[];

    @DeleteDateColumn()
    deletedAt: Date;
}

