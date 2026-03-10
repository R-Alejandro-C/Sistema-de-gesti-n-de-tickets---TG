import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { LocalArea } from './local-area.entity';

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

    @OneToMany(() => LocalArea, (localArea) => localArea.local)
    localAreas: LocalArea[];

    @DeleteDateColumn()
    deletedAt: Date;
}
