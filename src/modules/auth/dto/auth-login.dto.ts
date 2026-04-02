//  Đây là 1 file để validation các dữ liệu đầu vào từ 1 request, giúp đảm bảo dữ liệu gửi lên đúng định dạng, tránh lỗi khi xử lý dữ liệu trong service hoặc controller
// 1. Import các decorator từ class-validator để áp dụng các quy tắc validation cho từng trường dữ liệu
// 2. Tạo một class CreateUserDto để định nghĩa cấu trúc dữ liệu và các quy tắc validation cho việc tạo mới một user
// 3. Sử dụng các decorator như @IsString, @IsNotEmpty, @MinLength, @MaxLength để áp dụng các quy tắc validation cho từng trường dữ liệu
// 4. Khi có một request gửi lên với dữ liệu không hợp lệ, NestJS sẽ tự động trả về lỗi với thông báo chi tiết về lý do tại sao dữ liệu không hợp lệ

import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsString({ message: 'Username phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @MinLength(5, { message: 'Username tối thiểu 5 ký tự' })
  @MaxLength(30, { message: 'Username tối đa 30 ký tự' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;
}
