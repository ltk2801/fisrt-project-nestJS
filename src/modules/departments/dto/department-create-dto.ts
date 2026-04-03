// 1 DTO để có thể tạo 1 phòng ban mới 1 cách chuẩn
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class DepartmentCreateDto {
  @IsNotEmpty({ message: 'Tên phòng ban không được để trống' })
  @IsString({ message: 'Tên phòng ban phải là một chuỗi', always: true })
  @MaxLength(50, { message: 'Tên phòng ban không được vượt quá 50 ký tự' })
  name: string;

  @IsOptional({ message: 'Mô tả phòng ban có thể để trống' })
  @IsString({ message: 'Mô tả phòng ban phải là một chuỗi', always: true })
  @MaxLength(255, { message: 'Mô tả phòng ban chỉ có thể tối đa 255 ký tư' })
  description?: string;

  // Mặc định của SQL ở entity đã là 1 trường true, nhưng vẫn có thể thêm vào DTO nếu client muốn đặt là false
  // Nếu muốn admin tạo phòng ban on/off ngay từ đầu hoặc là không
  @IsBoolean({
    message: 'Trạng thái hoạt động của phòng ban phải là một giá trị boolean',
  })
  @IsOptional({
    message:
      'Trạng thái hoạt động của phòng ban có thể để trống, mặc định là true',
  })
  isActive?: boolean;
}
