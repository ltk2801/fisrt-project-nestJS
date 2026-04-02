import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/auth-register.dto';
import { LoginUserDto } from './dto/auth-login.dto';
import { RefreshTokenDto } from './dto/auth-refresh.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register
  @HttpCode(HttpStatus.OK) // Đặt mã trạng thái HTTP trả về là 200 OK thay vì 201 Created
  @Post('register')
  create(@Body() RegisterUserDto: RegisterUserDto) {
    return this.authService.registerUser(RegisterUserDto);
  }
  // Login
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.signIn(loginUserDto);
  }

  // Refresh Token
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  // Get profile, bao ve route nay bang Authguard, chi nhung request co token hop le moi duoc lay profile
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // Thông tin user đã được đính kèm vào request trong AuthGuard
  }
}
