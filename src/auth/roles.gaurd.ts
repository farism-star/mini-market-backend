// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),// هنا بقوله لو @Role()فوق الدالة هاتها
      context.getClass(),//هنا بقوله لو @Role()فوق الكلاس هاتها
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    // هنا المستخدم بيتحقظ ويجي من ال توكن هي دي الفكرة
    const user = request.user;
    
    return user && requiredRoles.includes(user.role);
  }
}
