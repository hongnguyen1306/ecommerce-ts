import type { User } from 'database/models/user.entity';

export interface IRequest {
  user: User;
}
