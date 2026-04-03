import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  ParseIntPipe,
  Logger,
  Query,
  ParseBoolPipe,
  ParseArrayPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { RolesGuard } from 'src/common/guards/role.guard';

// import DTO
import { DepartmentCreateDto } from './dto/department-create-dto';
import { DepartmentUpdateDto } from './dto/department-update-dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  // 1. Endpoint cho Dropdown (Chỉ lấy ID và Name của phòng ban)
  @Get('select-options')
  getSelectOptions() {
    return this.departmentsService.getSelectOptions();
  }

  // Ở đây tôi đã dùng Dto để validation dữ liệu nhập vào, nếu không sử dụng DTO, nó sẽ sử dụng các trường ở entity
  // Tiến hành phân quyền của user ở đây, chỉ có admin mới có thể tạo 1 phòng ban mới
  // Create a new department
  @UseGuards(AuthGuard, RolesGuard) // Bảo vệ route này bằng AuthGuard, chỉ những request có token hợp lệ mới được phép tạo phòng ban mới
  @Roles(Role.Admin) // Chỉ những user có role Admin mới được phép tạo phòng ban mới
  @Post()
  createDepartment(@Body() department: DepartmentCreateDto) {
    return this.departmentsService.createDepartment(department);
  }

  // Update a department
  @UseGuards(AuthGuard, RolesGuard) // Bảo vệ route này bằng AuthGuard, chỉ những request có token hợp lệ mới được phép cập nhật phòng ban
  @Roles(Role.Admin)
  @Patch(':id')
  // Đây là 1 ví dụ để sử dụng transfrom,
  updateDepartment(
    @Param('id') id: string,
    @Body() department: DepartmentUpdateDto,
  ) {
    return this.departmentsService.update(id, department);
  }

  // Delete a department
  @UseGuards(AuthGuard, RolesGuard) // Bảo vệ route này bằng AuthGuard, chỉ những request có token hợp lệ mới được phép cập nhật phòng ban
  @Roles(Role.Admin)
  @Delete(':id')
  removeDepartment(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
