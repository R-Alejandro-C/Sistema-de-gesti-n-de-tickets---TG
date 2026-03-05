import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);

        // Si no tiene pass_hash, no puede iniciar sesión (Regla de negocio 2)
        if (user && user.pass_hash && user.activo) {
            const isMatch = await bcrypt.compare(pass, user.pass_hash);
            if (isMatch) {
                const { pass_hash, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            username: user.nombre,
            sub: user.id_usuario,
            role: user.rol?.nombre,
            id_rol: user.id_rol
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id_usuario,
                nombre: user.nombre,
                role: user.rol?.nombre,
            }
        };
    }
}
