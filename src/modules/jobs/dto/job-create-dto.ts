// 1 DTO để có thể tạo 1 phòng ban mới 1 cách chuẩn
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUnique } from 'src/common/pipes/is-unique.validator';
import { Job } from '../entities/job.entity';
import { Type } from 'class-transformer';

export class JobCreateDto {
  // Title
  @ApiProperty({
    example: 'Quản lý dự án',
    description: 'Tên của chức vụ công việc đang đảm nhận',
    maxLength: 100,
  })
  @IsUnique(Job, 'title')
  @IsNotEmpty({ message: 'Tên chức vụ không được để trống' })
  @IsString({ message: 'Tên chức vụ phải là một chuỗi', always: true })
  @MaxLength(100, { message: 'Tên phòng ban không được vượt quá 100 ký tự' })
  title: string;

  // MinSalary
  @ApiPropertyOptional({
    example: 6000000,
    description: 'Muc luong toi thieu VND',
  })
  @Type(() => Number)
  @IsNotEmpty({ message: 'Luong toi thieu khong duoc de trong' })
  @IsNumber(
    {},
    { message: 'Muc luong toi thieu phai la 1 con so', always: true },
  )
  @Min(0, { message: 'Lương không được là số âm' })
  minSalary: number;

  // MaxSalary
  @ApiPropertyOptional({
    example: 20000000,
    description: 'Muc luong toi da VND',
  })
  @Type(() => Number)
  @IsNotEmpty({ message: 'Luong toi da khong duoc de trong' })
  @IsNumber({}, { message: 'Muc luong toi da phai la 1 con so', always: true })
  @Min(0, { message: 'Lương không được là số âm' })
  maxSalary: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Trang thai hoat dong cua chuc vu',
  })
  @IsBoolean({
    message: 'Trạng thái hoạt động của chuc vu phải là một giá trị boolean',
  })
  @IsOptional({
    message:
      'Trạng thái hoạt động của chuc vu có thể để trống, mặc định là true',
  })
  isActive?: boolean;
}
