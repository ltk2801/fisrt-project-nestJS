import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/users.entity';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
// Import DTOs
import { RegisterUserDto } from './dto/auth-register.dto';
import { LoginUserDto } from './dto/auth-login.dto';
import { ChangePasswordUserDto } from './dto/auth-change-password.dto';
// JWT
import { JwtService } from '@nestjs/jwt';
// Import bcrypt để compare lại password khi đăng nhập
import * as bcrypt from 'bcrypt';
// Import Employee service
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly employeesService: EmployeesService,
    // import Inject Datasource for manage transaction
    private dataSource: DataSource,
  ) {}

  // ******* FUNCTION. create a new user // Đã sử dụng Dto để có thể validation dư liệu đầu vào
  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    // 1. Hash mật khẩu của user trước khi lưu vào database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerUserDto.password, salt);

    // Begin transaction
    return await this.dataSource.transaction(async (manager) => {
      // Kiểm tra tồn tại (Dùng manager để check trong phiên làm việc của transaction)
      const exitsUser = await manager.findOne(User, {
        where: { username: registerUserDto.username },
      });
      if (exitsUser) {
        throw new ConflictException('Username đã tồn tại');
      }
      try {
        // Bước 1 : Tạo EMPLOYEE TRƯỚC (Vì User cần ID của Employee, Employee là bảng cha),
        // truyen manager vao de quan ly transaction
        const savedEmployee = await this.employeesService.createEmpty(manager);
        // Tao user va gan employee vua tao vao
        const newUser = manager.create(User, {
          username: registerUserDto.username,
          password: hashedPassword,
          employeeId: savedEmployee.id, // TypeORM tu trich xuat ID tu project nay
        });
        // luu user vao db
        return await manager.save(newUser);
      } catch (error) {
        // Nếu bước 4 hoặc 5 lỗi, toàn bộ thay đổi ở bước 3 (Employee) sẽ bị xóa sạch
        throw new InternalServerErrorException(
          'Đăng ký thất bại, dữ liệu đã được rollback',
        );
      }
    });
  }

  // *** FUCTION LOGIN USER
  async signIn(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // 1. Tìm username theo username bằng userService
    const user = await this.usersService.findByUsername(loginUserDto.username);

    // 2. Nếu không tìm thấy user thì trả về lỗi UnauthorizedException
    if (!user) {
      throw new UnauthorizedException(
        'Không tìm thấy userName này trên hệ thống',
      );
    }

    // 3. Kiểm tra mật khẩu có khớp với mật khẩu đã lưu trong database hay không
    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    // 4. Generate JWT tokens
    const payload = { username: user.username, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // 5. Lưu refresh token vào database
    await this.userRepository.update(user.id, { refreshToken: refresh_token });

    return {
      access_token,
      refresh_token,
    };
  }

  // *** FUNCTION REFRESH TOKEN - Tạo access token mới từ refresh token
  async refreshToken(refreshTokenDto: {
    refresh_token: string;
  }): Promise<{ access_token: string }> {
    try {
      // 1. Verify refresh token có hợp lệ không
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token);

      // 2. Kiểm tra user có tồn tại và refresh token khớp không
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshTokenDto.refresh_token) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      // 3. Generate access token mới
      const newPayload = { username: user.username, sub: user.id };
      const access_token = this.jwtService.sign(newPayload);

      return {
        access_token,
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }
  // ChangePassword
  async changePassword(
    userId: string,
    changePasswordUserdto: ChangePasswordUserDto,
  ): Promise<{}> {
    // Find user by userId
    const user = await this.usersService.findById(userId);
    // if user not found
    if (!user) {
      throw new UnauthorizedException(
        'Không tìm thấy userName này trên hệ thống',
      );
    }
    // checking oldPassword === password.compare
    const isMatch = await bcrypt.compare(
      changePasswordUserdto.oldPassword,
      user.password,
    );
    // if not mathch, throw error
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng');
    }
    // else
    // Hash mật khẩu của user trước khi lưu vào database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      changePasswordUserdto.newPassword,
      salt,
    );
    // updatePassword in DB & Loggout user
    await this.usersService.updatePassword(userId, hashedPassword);
    // 4. Generate JWT tokens
    const payload = { username: user.username, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    return {
      message: 'Password updated',
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  // **** FUNCtION LOGOUT
  async logout(userId: string): Promise<void> {
    // clear refresh token của user trong database
    await this.usersService.clearRefreshToken(userId.toString());
  }
}
