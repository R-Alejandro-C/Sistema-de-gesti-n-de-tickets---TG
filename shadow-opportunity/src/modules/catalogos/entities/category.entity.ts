import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SubCategory } from './sub-category.entity';
import { AreaCategory } from './area-category.entity';
import { CategorySubCategory } from './category-subcategory.entity';

@Entity('categorias')
export class Category {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_categoria: number;

    @ApiProperty({ example: 'Hardware' })
    @Column()
    nombre: string;

    @OneToMany(() => AreaCategory, (areaCategory) => areaCategory.categoria)
    areaCategories: AreaCategory[];

    @OneToMany(() => CategorySubCategory, (catSubCat) => catSubCat.category)
    categorySubCategories: CategorySubCategory[];

    @DeleteDateColumn()
    deletedAt: Date;
}
