import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(dto: CreateUserDto): Promise<Partial<User>> {
        const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
        if (existing) throw new ConflictException('Email ya registrado');

        const hash = await bcrypt.hash(dto.password, 10);
        const user = this.usersRepository.create({
            nombre: dto.nombre,
            email: dto.email,
            pass_hash: hash,
            id_rol: dto.id_rol,
            activo: dto.activo ?? true,
        });

        const saved = await this.usersRepository.save(user);
        const { pass_hash, ...result } = saved;
        return result;
    }

    async findAll(pagination: PaginationDto) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;

        const [data, total] = await this.usersRepository.findAndCount({
            relations: ['rol'],
            skip: (page - 1) * limit,
            take: limit,
            select: ['id_usuario', 'nombre', 'email', 'id_rol', 'activo', 'created_at'],
        });
        return { data, total, page, lastPage: Math.ceil(total / limit) };
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email: email },
            relations: ['rol'],
            select: ['id_usuario', 'nombre', 'email', 'pass_hash', 'id_rol', 'activo'],
        });
    }

    async findById(id: number): Promise<Partial<User> | null> {
        return this.usersRepository.findOne({
            where: { id_usuario: id },
            relations: ['rol'],
            select: ['id_usuario', 'nombre', 'email', 'id_rol', 'activo', 'created_at'],
        });
    }

    async update(id: number, dto: UpdateUserDto) {
        const user = await this.findById(id);
        if (!user) throw new NotFoundException('Usuario no encontrado');

        if (dto.email && dto.email !== user.email) {
            const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
            if (existing) throw new ConflictException('Email ya registrado por otro usuario');
        }

        if (dto.password) {
            user.pass_hash = await bcrypt.hash(dto.password, 10);
        }

        // Remove password from dto so Object.assign doesn't try to set it directly to user entity
        const { password, ...updateData } = dto;
        Object.assign(user, updateData);

        return this.usersRepository.save(user);
    }

    async remove(id: number) {
        const user = await this.findById(id);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return this.usersRepository.softDelete(id);
    }
}
