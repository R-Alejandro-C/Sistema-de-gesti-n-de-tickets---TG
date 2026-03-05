import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Area } from './area.entity';
import { SubCategory } from './sub-category.entity';

@Entity('categorias')
export class Category {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_categoria: number;

    @ApiProperty({ example: 'Hardware' })
    @Column()
    nombre: string;

    @ApiProperty({ example: 1 })
    @Column({ name: 'id_area' })
    id_area: number;

    @ManyToOne(() => Area, (area) => area.categorias)
    @JoinColumn({ name: 'id_area' })
    area: Area;

    @OneToMany(() => SubCategory, (subCat) => subCat.categoria)
    subcategorias: SubCategory[];

    @DeleteDateColumn()
    deletedAt: Date;
}
