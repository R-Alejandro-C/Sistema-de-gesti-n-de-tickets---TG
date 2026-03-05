import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Area } from './area.entity';

@Entity('locales')
export class Local {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_local: number;

    @ApiProperty({ example: 'Sede Central' })
    @Column({ unique: true })
    nombre: string;

    @ApiProperty({ example: 'Av. Principal 123', required: false })
    @Column({ nullable: true })
    direccion: string;

    @OneToMany(() => Area, (area) => area.local)
    areas: Area[];

    @DeleteDateColumn()
    deletedAt: Date;
}
