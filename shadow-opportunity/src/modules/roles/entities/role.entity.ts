import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_rol: number;

    @ApiProperty({ example: 'ADMIN' })
    @Column({ unique: true })
    nombre: string;

    @OneToMany(() => User, (user) => user.rol)
    usuarios: User[];

    @DeleteDateColumn()
    deletedAt: Date;
}
