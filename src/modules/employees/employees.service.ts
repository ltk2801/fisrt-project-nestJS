import { Injectable } from '@nestjs/common';
import { Employee } from './entities/employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}
  // get all employees
  findAll() {
    return this.employeesRepository.find();
  }
  // create a new employee
  create(employee: Employee) {
    return this.employeesRepository.save(employee);
  }
  // find an employee by id
  findOne(id: string) {
    return this.employeesRepository.findOneBy({ id });
  }
  // update an employee
  async update(id: string, employee: Employee) {
    await this.employeesRepository.update(id, employee);
    return this.employeesRepository.findOneBy({ id });
  }
  // delete an employee
  async remove(id: string) {
    await this.employeesRepository.delete(id);
    return { deleted: true };
  }
}
