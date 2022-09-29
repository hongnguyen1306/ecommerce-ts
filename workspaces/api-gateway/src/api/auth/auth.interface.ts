import type { User } from 'database/models/user.entity';

export interface IJwtPayload {
  username: string;
}

export interface IAuthProps {
  profile: User;
  authToken: string;
}
