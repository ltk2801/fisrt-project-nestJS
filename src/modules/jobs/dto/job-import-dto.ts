// job-import.dto.ts
import {
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class JobImportDto {
  @IsString()
  @MaxLength(100, { message: 'Tên chức vụ không được vượt quá 100 ký tự' })
  title: string;

  @IsNumber({}, { message: 'Lương tối thiểu phải là số' })
  @Min(0, { message: 'Lương tối thiểu không được âm' })
  minSalary: number;

  @IsNumber({}, { message: 'Lương tối đa phải là số' })
  @Min(0, { message: 'Lương tối đa không được âm' })
  maxSalary: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
