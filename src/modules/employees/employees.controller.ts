import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Logger,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // Get all employees
  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  // Get a single employee by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  // create a. new employee
  @Post()
  create(@Body() employee: Employee) {
    return this.employeesService.create(employee);
  }

  // update an employee
  @Patch(':id')
  update(@Param('id') id: string, @Body() employee: Employee) {
    return this.employeesService.update(id, employee);
  }

  // delete an employee
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
