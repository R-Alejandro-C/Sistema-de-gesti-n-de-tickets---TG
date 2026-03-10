import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from './category.entity';
import { SubCategory } from './sub-category.entity';

@Entity('category_subcategories')
@Unique(['id_categoria', 'id_subcategoria'])
export class CategorySubCategory {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_cat_subcat: number;

    @ApiProperty({ example: 1 })
    @Column()
    id_categoria: number;

    @ManyToOne(() => Category, (category) => category.categorySubCategories)
    @JoinColumn({ name: 'id_categoria' })
    category: Category;

    @ApiProperty({ example: 1 })
    @Column()
    id_subcategoria: number;

    @ManyToOne(() => SubCategory, (subCategory) => subCategory.categorySubCategories)
    @JoinColumn({ name: 'id_subcategoria' })
    subCategory: SubCategory;
}
