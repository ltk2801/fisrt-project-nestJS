import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';

@Injectable()
// trả về true, req được đi tiếp, ngược lại thì req sẽ bị chặn lại và trả về lỗi UnauthorizedException
export class GuestGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lấy ra đối tượng request từ context , ta phải chỉ định là đang dùng HTTP
    const request = context.switchToHttp().getRequest();
    // Đây là hàm phụ trợ để lấy chuỗi token từ Header , nó tìm trong mục Authorization, thường có
    // dạng là Bearer <chuỗi_token>
    const token = this.extractTokenFromHeader(request);
    // Nếu không tìm thấy token nào trong header, trả về lỗi UnauthorizedException

    if (token) {
      // Dùng cái chìa khoá "JWT_SECRET" để giải mã token, nếu token hợp lệ thì sẽ trả về payload chứa thông tin user đã được mã hoá trong token, nếu token không hợp lệ sẽ ném lỗi và bị catch ở đây
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      // Nếu xác thực token thành công, ta đính kèm thông tin của người dùng vào đối tượng request.
      // Nhờ đó, ở Controller bạn có thể lấy được thông tin của người dùng đang gọi API thông qua @Req() req
      request['user'] = payload;
      throw new UnauthorizedException('Already logged in, unable to use ');
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request?.headers?.authorization?.split(' ') ?? [];
    if (token && (token.startsWith('{{') || token.includes('{{'))) {
      return undefined; // Ép về undefined
    }
    return type === 'Bearer' ? token : undefined;
  }
}
