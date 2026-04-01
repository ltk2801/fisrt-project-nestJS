import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  // Get all departments
  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  // Get a single department by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  // Create a new department
  @Post()
  create(@Body() department: Department) {
    return this.departmentsService.create(department);
  }

  // Update a department
  @Patch(':id')
  update(@Param('id') id: string, @Body() department: Department) {
    return this.departmentsService.update(id, department);
  }

  // Delete a department
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
