import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
    @ApiPropertyOptional({
        description: 'Número de página (1-indexado)',
        default: 1,
        minimum: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Cantidad de elementos por página',
        default: 10,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Si es true, filtra solo los tickets del usuario autenticado',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    owner?: boolean = false;

    @ApiPropertyOptional({ description: 'Término de búsqueda', type: String })
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ description: 'Filtrar por ID de estado', type: Number })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    id_estado?: number;

    @ApiPropertyOptional({ description: 'Fecha de inicio para filtros', example: '2026-01-01' })
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ description: 'Fecha de fin para filtros', example: '2026-12-31' })
    @IsOptional()
    endDate?: string;
}

export class PaginatedResponseDto<T> {
    data: T[];

    @ApiPropertyOptional()
    total: number;

    @ApiPropertyOptional()
    page: number;

    @ApiPropertyOptional()
    lastPage: number;
}
