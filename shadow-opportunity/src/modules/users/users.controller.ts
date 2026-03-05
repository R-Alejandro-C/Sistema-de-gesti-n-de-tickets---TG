import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Crear usuario (Solo ADMIN)' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles('ADMIN', 'SOPORTE')
    @ApiOperation({ summary: 'Listar usuarios con paginación' })
    findAll(@Query() pagination: PaginationDto) {
        return this.usersService.findAll(pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener usuario por ID' })
    findOne(@Param('id') id: string) {
        return this.usersService.findById(+id);
    }

    @Patch(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Actualizar usuario' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Soft delete de usuario' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
