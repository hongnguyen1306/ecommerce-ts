import { Injectable, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';

import { ROLES_KEY } from 'api/admin/guard/roles.decorator';
import type { IRequest } from 'interface';
import type { TRole } from 'database/models/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roleList = this.reflector.getAllAndOverride<TRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest<IRequest>();

    return roleList.includes(user.role);
  }
}
