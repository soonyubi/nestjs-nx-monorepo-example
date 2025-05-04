// libs/auth/src/lib/services/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@org/db';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  JwtPayload,
  LoginDto,
  RegisterDto,
  TokenResponse,
} from '../interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.CUSTOMER,
      },
    });
  }

  generateTokens(user: User): TokenResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      // Optionally add refresh token logic here
    };
  }

  async getUserFromToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
    } catch (error) {
      return null;
    }
  }
}
