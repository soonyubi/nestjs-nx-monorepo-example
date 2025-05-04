import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import type {
  LoginDto,
  RegisterDto,
  TokenResponse,
} from '../interfaces/auth.interface';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto
  ): Promise<{ user: Omit<User, 'password'> }> {
    const user = await this.authService.register(registerDto);
    const { password, ...result } = user;
    return { user: result };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(loginDto);
  }
}
