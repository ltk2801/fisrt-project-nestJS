import { Injectable } from '@nestjs/common';
import { Employee } from './entities/employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

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
  /////////////
  // create a new employee, Sử dụng manager từ bên ngoài truyền vào để áp dụng transaction
  async createEmpty(manager?: EntityManager) {
    // Neu co manager duoc truyen vao , dung no de lay Repository
    // Neu khong, dung repository mac dinh cua service
    const repo = manager
      ? manager.getRepository(Employee)
      : this.employeesRepository;
    try {
      // .create({}) giúp khởi tạo các giá trị default đã định nghĩa trong Entity
      const newEmployee = repo.create({});
      return await repo.save(newEmployee);
    } catch (error) {
      // Log ra để biết chính xác Database đang than phiền về cột nào
      console.error('Database Error:', error.message);
      throw error;
    }
  }
  /////////////
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
