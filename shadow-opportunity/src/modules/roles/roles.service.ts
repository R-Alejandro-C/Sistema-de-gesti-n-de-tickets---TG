import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    ) { }

    async create(nombre: string) {
        return this.roleRepo.save(this.roleRepo.create({ nombre }));
    }

    async findAll() {
        return this.roleRepo.find();
    }

    async findOne(id: number) {
        const role = await this.roleRepo.findOne({ where: { id_rol: id } });
        if (!role) throw new NotFoundException('Rol no encontrado');
        return role;
    }

    async update(id: number, nombre: string) {
        const role = await this.findOne(id);
        role.nombre = nombre;
        return this.roleRepo.save(role);
    }

    async remove(id: number) {
        const role = await this.findOne(id);
        return this.roleRepo.softDelete(id);
    }
}

