import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Verificar si el usuario tiene rol (Regla de negocio 3)
        if (!user || !user.role) {
            throw new ForbiddenException('No tienes permisos (Rol requerido)');
        }

        const hasRole = roles.includes(user.role);
        if (!hasRole) {
            throw new ForbiddenException('No tienes el rol necesario para esta acción');
        }

        return true;
    }
}
