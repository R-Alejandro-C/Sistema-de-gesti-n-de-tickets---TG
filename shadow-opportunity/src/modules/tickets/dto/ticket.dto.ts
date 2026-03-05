import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEmail } from 'class-validator';

export class CreateTicketDto {
    @ApiPropertyOptional({ example: 'Juan Perez', description: 'Requerido solo en tickets públicos (sin sesión)' })
    @IsOptional()
    @IsString()
    nombre_solicitante?: string;

    @ApiPropertyOptional({ example: 'juan@local.com', description: 'Opcional - email del solicitante' })
    @IsOptional()
    @IsString()
    @IsEmail()
    mail_solicitante?: string;

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    id_local: number;

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    id_area: number;

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    id_categoria: number;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsNumber()
    id_subcategoria?: number;

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    id_tipo: number;

    @ApiPropertyOptional({ example: 1, description: 'Prioridad inicial (opcional, puede ser asignada luego)' })
    @IsOptional()
    @IsNumber()
    id_prioridad?: number;

    @ApiProperty({ example: 'Mi monitor parpadea' })
    @IsNotEmpty()
    @IsString()
    detalle: string;
}

export class UpdateTicketDto {
    @ApiPropertyOptional({ example: 2 })
    @IsOptional()
    @IsNumber()
    id_usuario_asignado?: number;

    @ApiPropertyOptional({ example: 2 })
    @IsOptional()
    @IsNumber()
    id_prioridad?: number;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsNumber()
    id_categoria?: number;

    @ApiPropertyOptional({ example: 4 })
    @IsOptional()
    @IsNumber()
    id_subcategoria?: number;

    @ApiPropertyOptional({ example: 3 })
    @IsOptional()
    @IsNumber()
    id_estado?: number;

    @ApiPropertyOptional({ example: 'Se reemplazó el monitor' })
    @IsOptional()
    @IsString()
    solucion_detalle?: string;

    @ApiPropertyOptional({ example: 'Iniciando diagnóstico físico' })
    @IsOptional()
    @IsString()
    comentario_historial?: string;
}
