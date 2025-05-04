import { UserRole } from '@prisma/client';

export class CreateUserDto {
  email!: string;
  password!: string;
  name!: string;
  role?: UserRole;
}

export class UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
}

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  role!: UserRole;
  createdAt!: Date;
  updatedAt!: Date;
}
