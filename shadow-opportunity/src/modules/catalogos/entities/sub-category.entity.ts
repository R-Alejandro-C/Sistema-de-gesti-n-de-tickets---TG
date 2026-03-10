import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CategorySubCategory } from './category-subcategory.entity';

@Entity('subcategorias')
export class SubCategory {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_subcategoria: number;

    @ApiProperty({ example: 'Laptops' })
    @Column()
    nombre: string;

    @OneToMany(() => CategorySubCategory, (catSubCat) => catSubCat.subCategory)
    categorySubCategories: CategorySubCategory[];

    @DeleteDateColumn()
    deletedAt: Date;
}
