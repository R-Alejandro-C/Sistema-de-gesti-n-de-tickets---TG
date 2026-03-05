import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateLocalDto {
    @ApiProperty({ example: 'Sede Central' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiPropertyOptional({ example: 'Av. Principal 123' })
    @IsString()
    @IsOptional()
    direccion?: string;
}

export class UpdateLocalDto extends PartialType(CreateLocalDto) { }

export class CreateAreaDto {
    @ApiProperty({ example: 'Soporte Técnico' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiPropertyOptional({ example: 1, description: 'ID del local al que pertenece el área' })
    @IsNumber()
    @IsOptional()
    id_local?: number;
}

export class UpdateAreaDto extends PartialType(CreateAreaDto) { }

export class CreateCategoryDto {
    @ApiProperty({ example: 'Hardware' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    id_area: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }

export class CreateSubCategoryDto {
    @ApiProperty({ example: 'Laptops' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    id_categoria: number;
}

export class UpdateSubCategoryDto extends PartialType(CreateSubCategoryDto) { }

export class CreatePriorityDto {
    @ApiProperty({ example: 'Alta' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 4 })
    @IsNumber()
    @Min(1)
    sla_horas: number;
}

export class UpdatePriorityDto extends PartialType(CreatePriorityDto) { }

export class CreateStatusDto {
    @ApiProperty({ example: 'Registrado' })
    @IsString()
    @IsNotEmpty()
    nombre: string;
}

export class UpdateStatusDto extends PartialType(CreateStatusDto) { }

export class CreateTypeDto {
    @ApiProperty({ example: 'Incidencia' })
    @IsString()
    @IsNotEmpty()
    nombre: string;
}

export class UpdateTypeDto extends PartialType(CreateTypeDto) { }

