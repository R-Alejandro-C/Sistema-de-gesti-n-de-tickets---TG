import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
    @ApiResponse({ status: 200, description: 'Login exitoso' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas o usuario no autorizado');
        }
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
