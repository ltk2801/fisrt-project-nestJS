import {
  StreamableFile,
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Query,
  Res,
  Logger,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

// Import Dto
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeDetailResponseDto } from './dto/employee-detail-response.dto';

// Import Auth
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Role } from 'src/common/enum/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
//
import type { Response } from 'express';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // Get all employees
  @ApiOperation({ summary: 'Lay danh sach nhan vien' })
  @ApiOkResponse({ description: 'Lay danh sach nhan vien thanh cong' })
  @Get()
  findAll() {
    return this.employeesService.findAll();
  }
  // Export Data to Excel
  @ApiOperation({
    summary:
      'Export danh sach full danh sách thông tin của nhân viên ra file Excel',
  })
  @ApiBearerAuth('access-token')
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Danh sach field can export, cach nhau boi dau phay',
    example: 'employeeId,fullName,email,hireDate,...',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Trang du lieu can export',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'So ban ghi trong moi trang khi export',
    example: 20,
  })
  @ApiOkResponse({
    description: 'Tra ve file Excel danh sach nhan vien',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @UseGuards(AuthGuard)
  @Get('export-data')
  async exportData(
    // Neu khong co bat cu query nao gui vao thi se export all du lieu
    @Query('fields') fields: string, // Client gui ?fields = id,name hoac ?fiedls = name,des de export duoc dung du lieu
    @Query('page') page: number, // Neu muon lay du lieu tu page nao thi nhap vao day
    @Query('limit') limit: number, // So dong du lieu trong 1 trang muon lay
    @Res({ passthrough: true }) res: Response,
  ) {
    const fileStream =
      await this.employeesService.exportFullInfoEmployeeToExcel(
        fields,
        page,
        limit,
      );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="employees.xlsx"',
    );
    return new StreamableFile(fileStream);
  }

  // Get a single employee by id
  @ApiOperation({ summary: 'Lay chi tiet mot nhan vien' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiOkResponse({ description: 'Lay chi tiet nhan vien thanh cong' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  // Get a full info employee by id
  @ApiOperation({ summary: 'Lay thong tin chi tiet nhan vien da duoc rut gon' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiOkResponse({
    description: 'Lay thong tin chi tiet nhan vien thanh cong',
    type: EmployeeDetailResponseDto,
  })
  @Get('full-info/:id')
  async getFullInfo(@Param('id') id: string) {
    return this.employeesService.getEmployeeDetails(id);
  }

  //  update Profile
  @ApiOperation({ summary: 'Cap nhat các thông tin của bản thân ' })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ description: 'Cap nhat thông tin cá nhân thanh cong' })
  @UseGuards(AuthGuard)
  @Patch('updateProfile')
  updateProfile(@Request() req, @Body() UpdateProfileDto: UpdateProfileDto) {
    return this.employeesService.updateProfile(req.user.sub, UpdateProfileDto);
  }

  // update an employee by Admin/Manager
  @ApiOperation({ summary: 'Cap nhat nhan vien by Admin/Manager' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiOkResponse({ description: 'Cap nhat nhan vien thanh cong' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Manager)
  @Patch(':id')
  updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.updateAnEmployee(id, updateEmployeeDto);
  }

  // delete an employee
  @ApiOperation({ summary: 'Xoa nhan vien' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiOkResponse({ description: 'Xoa nhan vien thanh cong' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
