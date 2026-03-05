import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seeds')
@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) { }

    @Post()
    @ApiOperation({ summary: 'Ejecutar carga inicial de datos (Seeds)' })
    executeSeed() {
        return this.seedService.runSeed();
    }
}
