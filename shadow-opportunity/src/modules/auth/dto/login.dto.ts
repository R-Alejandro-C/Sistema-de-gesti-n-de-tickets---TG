import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'admin@local.com' })
    @IsEmail({}, { message: 'El formato del email no es válido' })
    @IsNotEmpty({ message: 'El email es obligatorio' })
    email: string;

    @ApiProperty({ example: 'Admin123' })
    @IsString({ message: 'La contraseña debe ser un texto' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;
}
