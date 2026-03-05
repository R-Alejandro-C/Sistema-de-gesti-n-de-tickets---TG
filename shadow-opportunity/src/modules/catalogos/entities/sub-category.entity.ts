import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from './category.entity';

@Entity('subcategorias')
export class SubCategory {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_subcategoria: number;

    @ApiProperty({ example: 'Laptops' })
    @Column()
    nombre: string;

    @ApiProperty({ example: 1 })
    @Column({ name: 'id_categoria' })
    id_categoria: number;

    @ManyToOne(() => Category, (cat) => cat.subcategorias)
    @JoinColumn({ name: 'id_categoria' })
    categoria: Category;

    @DeleteDateColumn()
    deletedAt: Date;
}
