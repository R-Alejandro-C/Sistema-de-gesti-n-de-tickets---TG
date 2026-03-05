import { Controller, Get, Post, Body, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty, PartialType } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IsString, IsNotEmpty } from 'class-validator';

class CreateRoleDto {
    @ApiProperty({ example: 'SOPORTE' })
    @IsString()
    @IsNotEmpty()
    nombre: string;
}

class UpdateRoleDto extends PartialType(CreateRoleDto) { }

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Crear nuevo rol (Solo ADMIN)' })
    create(@Body() dto: CreateRoleDto) {
        return this.rolesService.create(dto.nombre);
    }

    @Get()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Listar roles' })
    findAll() {
        return this.rolesService.findAll();
    }

    @Patch(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Actualizar rol' })
    update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
        if (!dto.nombre) return this.rolesService.findOne(+id);
        return this.rolesService.update(+id, dto.nombre);
    }


    @Delete(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Eliminar rol' })
    remove(@Param('id') id: string) {
        return this.rolesService.remove(+id);
    }
}

