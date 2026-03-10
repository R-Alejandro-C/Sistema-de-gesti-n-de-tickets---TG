import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Area } from './area.entity';
import { Category } from './category.entity';

@Entity('area_categories')
@Unique(['id_area', 'id_categoria'])
export class AreaCategory {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_area_categoria: number;

    @ApiProperty({ example: 1 })
    @Column()
    id_area: number;

    @ManyToOne(() => Area, (area) => area.areaCategories)
    @JoinColumn({ name: 'id_area' })
    area: Area;

    @ApiProperty({ example: 1 })
    @Column()
    id_categoria: number;

    @ManyToOne(() => Category, (category) => category.areaCategories)
    @JoinColumn({ name: 'id_categoria' })
    categoria: Category;
}
