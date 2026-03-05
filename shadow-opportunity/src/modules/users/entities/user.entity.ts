import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../roles/entities/role.entity';

@Entity('usuarios')
export class User {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id_usuario: number;

    @ApiProperty({ example: 'Admin User' })
    @Column()
    nombre: string;

    @ApiProperty({ example: 'admin@local.com' })
    @Column({ unique: true, nullable: true })
    email: string;

    @Column({ nullable: true, select: false })
    pass_hash: string;

    @ApiProperty({ example: 1 })
    @Column({ nullable: true })
    id_rol: number;

    @ManyToOne(() => Role, { nullable: true })
    @JoinColumn({ name: 'id_rol' })
    rol: Role;

    @ApiProperty({ example: true })
    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
