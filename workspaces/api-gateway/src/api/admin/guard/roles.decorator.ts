import { SetMetadata } from '@nestjs/common';
import type { TRole } from 'database/models/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...role: TRole[]) => {
  return SetMetadata(ROLES_KEY, role);
};
