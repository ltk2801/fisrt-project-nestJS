import { Injectable } from '@nestjs/common';
import { Department } from './entities/department.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}
  // get all departments
  findAll() {
    return this.departmentsRepository.find();
  }
  // create a new department
  create(department: Department) {
    console.log(department);
    return this.departmentsRepository.save(department);
  }
  // find a department by id
  findOne(id: string) {
    return this.departmentsRepository.findOneBy({ id });
  }
  // update a department
  async update(id: string, department: Department) {
    await this.departmentsRepository.update(id, department);
    return this.departmentsRepository.findOneBy({ id });
  }
  // delete a department
  async remove(id: string) {
    await this.departmentsRepository.delete(id);
    return { deleted: true };
  }
}
