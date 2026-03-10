import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Seeds')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) { }

    @Post()
    @ApiOperation({ summary: 'Ejecutar carga inicial de datos (Seeds)' })
    executeSeed() {
        return this.seedService.runSeed();
    }
}
