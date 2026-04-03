import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';

const jwtSecret = process.env.JWT_SECRET; // Lấy giá trị JWT_SECRET từ biến môi trường .env

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: jwtSecret, // Sử dụng giá trị JWT_SECRET từ biến môi trường
      signOptions: { expiresIn: '6d' }, // Token sẽ hết hạn sau 6 ngày
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule], // Export AuthService để có thể sử dụng trong các module khác nếu cần
})
export class AuthModule {}
