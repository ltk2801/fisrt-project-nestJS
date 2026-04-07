import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from 'src/common/enum/role.enum';

export class EmployeeProfileDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  firstName: string | null;

  @ApiPropertyOptional()
  lastName: string | null;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  email: string | null;

  @ApiPropertyOptional()
  phoneNumber: string | null;

  @ApiPropertyOptional()
  hireDate: Date | null;

  @ApiProperty()
  isActive: boolean;
}

export class EmployeeDepartmentSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty()
  isActive: boolean;
}

export class EmployeeJobSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  minSalary: number;

  @ApiProperty()
  maxSalary: number;

  @ApiProperty()
  isActive: boolean;
}

export class EmployeeAccountSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  isActive: boolean;
}

export class EmployeeDetailResponseDto {
  @ApiProperty({ type: EmployeeProfileDto })
  employee: EmployeeProfileDto;

  @ApiPropertyOptional({ type: EmployeeDepartmentSummaryDto, nullable: true })
  department: EmployeeDepartmentSummaryDto | null;

  @ApiPropertyOptional({ type: EmployeeJobSummaryDto, nullable: true })
  job: EmployeeJobSummaryDto | null;

  @ApiPropertyOptional({ type: EmployeeAccountSummaryDto, nullable: true })
  account: EmployeeAccountSummaryDto | null;
}
