import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
// trả về true, req được đi tiếp, ngược lại thì req sẽ bị chặn lại và trả về lỗi UnauthorizedException
export class GuestGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lấy ra đối tượng request từ context , ta phải chỉ định là đang dùng HTTP
    const request = context.switchToHttp().getRequest();
    // Đây là hàm phụ trợ để lấy chuỗi token từ Header , nó tìm trong mục Authorization, thường có
    // dạng là Bearer <chuỗi_token>
    const token = this.extractTokenFromHeader(request);
    // Nếu không tìm thấy token nào trong header, trả về lỗi UnauthorizedException
    if (token) {
      throw new UnauthorizedException('Already logged in, unable to use ');
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request?.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
