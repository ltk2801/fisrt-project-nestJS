// Sử dụng các phương thức validation kế thừa từ RegisterUserDto
import { IsString, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Role } from 'src/common/enum/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái user phải là True/False' })
  isActive: boolean;

  // Sử dụng Enum để rằng buộc dữ liệu nhập vào DB
  @IsOptional()
  @IsEnum(Role, {
    message: 'Role muse be either ADMIN, USER, or MANAGER',
  })
  role: Role;

  @IsOptional()
  @IsString()
  employeeId: string;
}
