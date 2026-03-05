import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 'john@local.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Password123' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    id_rol: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    activo?: boolean;
}

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John Updated' })
    @IsString()
    @IsOptional()
    nombre?: string;

    @ApiPropertyOptional({ example: 'john@local.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: 'NewPass123' })
    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsNumber()
    @IsOptional()
    id_rol?: number;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    activo?: boolean;
}
