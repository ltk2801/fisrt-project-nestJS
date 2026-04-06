import {
  IsString,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Max,
  IsEmail,
  Matches,
  IsDate,
  MinDate,
  MaxDate,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsUnique } from 'src/common/pipes/is-unique.validator';

export class UpdateEmployeeDto {
  @ApiProperty({ example: 'An', description: 'Tên riêng của nhân viên' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString()
  @MinLength(1, { message: 'Tên riêng tối thiểu 1 ký tự' })
  @MaxLength(10, { message: 'Tên riêng tối đa 10 ký tự' })
  @Transform(({ value }) => value.trim().toUpperCase())
  firstName: string;

  @ApiProperty({ example: 'Nguyen', description: 'Họ của nhân viên' })
  @IsNotEmpty({ message: 'Họ không được để trống' })
  @IsString()
  @MinLength(2, { message: 'Họ của nhân viên tối thiểu 2 ký tự' })
  @MaxLength(50, { message: 'Họ của nhân viên tối đa 50 ký tự' })
  @Transform(({ value }) => value.trim().toUpperCase())
  lastName: string;

  @ApiProperty({
    example: 'nguyenAn@example.com',
    description: 'Email liên hệ của nhân viên',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    example: '0975087855',
    description: 'Số điện thoại',
  })
  @IsString()
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, {
    message: 'Số điện thoại không đúng định dạng VN',
  })
  @MinLength(10, { message: 'Số điện thoại phải đúng 10 ký tự' })
  @MaxLength(10, { message: 'Số điện thoại phải đúng 10 ký tự' })
  @Transform(({ value }) => {
    // ép kiểu về string để lưu vào db
    return value?.toString().trim();
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '44d58f3c-f66b-4a9f-8ae0-0a6b349a02b1',
    description: 'ID phòng ban nhân viên trực thuộc',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    example: '44d58f3c-f66b-4a9f-8ae0-0a6b349a02b1',
    description: 'ID chức danh của nhân viên ',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({
    example: '01/04/2026',
    description: 'Ngay nhan viec cua nhan vien',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @MinDate(new Date('2000-01-01'), {
    message: 'Ngay vao lam viec khong duoc truoc nam 2000',
  })
  @MaxDate(new Date(), { message: 'Ngay vao lam viec khong hop le' })
  hireDate?: Date;

  @ApiProperty({
    example: true,
    description: 'Trang thai cua nhan vien',
    required: false,
  })
  @IsBoolean({ message: 'Trang thai cua nhan vien phai la True/False' })
  isActive?: boolean;
}
