import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Employee } from './entities/employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';

// Import DTO
import { UpdateEmployeeDto } from './dto/update-employee.dto';

// Import Interface

// Import service
import { JobsService } from '../jobs/jobs.service';
import { DepartmentsService } from '../departments/departments.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from '../users/users.service';

/////////

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    private readonly jobsService: JobsService,
    private readonly departmentsService: DepartmentsService,
    private readonly usersService: UsersService,
  ) {}

  private async validateUniqueness(
    employeeId: string,
    email?: string,
    phoneNumber?: string,
  ) {
    if (email) {
      const existing = await this.employeesRepository.findOne({
        where: { email, id: Not(employeeId) },
      });
      if (existing)
        throw new BadRequestException(`Email đã tồn tại trong hệ thống`);
    }

    if (phoneNumber) {
      const existing = await this.employeesRepository.findOne({
        where: { phoneNumber, id: Not(employeeId) },
      });
      if (existing)
        throw new BadRequestException(
          `Số điện thoại đã tồn tại trong hệ thống`,
        );
    }
  }

  private async validateReferences(jobId?: string, departmentId?: string) {
    if (jobId) {
      const job = await this.jobsService.findOne(jobId);
      if (!job) throw new BadRequestException(`JobId: ${jobId} không tồn tại`);
    }

    if (departmentId) {
      const dept = await this.departmentsService.findOne(departmentId);
      if (!dept)
        throw new BadRequestException(
          `DepartmentId: ${departmentId} không tồn tại`,
        );
    }
  }

  // **************************** get all employees
  findAll() {
    return this.employeesRepository.find();
  }
  // **************************** create a new employee, Sử dụng manager từ bên ngoài truyền vào để áp dụng transaction
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
  // ****************************find an employee by id
  findOne(id: string) {
    return this.employeesRepository.findOneBy({ id });
  }
  // **************************** update an employee by ADMIN or Manager
  async updateAnEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.employeesRepository.findOneBy({ id });
    if (!employee) throw new BadRequestException(`Không tìm thấy nhân viên`);

    // Gọi helpers
    await this.validateReferences(
      updateEmployeeDto.jobId,
      updateEmployeeDto.departmentId,
    );
    await this.validateUniqueness(
      id,
      updateEmployeeDto.email,
      updateEmployeeDto.phoneNumber,
    );

    await this.employeesRepository.update(id, updateEmployeeDto);
    return { message: 'Updated Employee Successful' };
  }

  // **************************** Update profile
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.usersService.findById(userId);
    const employeeId = user.employeeId;
    if (!employeeId)
      throw new BadRequestException(
        `Không tìm thấy thông tin nhân viên liên kết`,
      );

    // Profile thường không cho sửa Job/Dept, nên chỉ cần check Uniqueness
    await this.validateUniqueness(
      employeeId,
      updateProfileDto.email,
      updateProfileDto.phoneNumber,
    );

    await this.employeesRepository.update(employeeId, updateProfileDto);
    return { message: 'Updated Profile Successful' };
  }

  // **************************** delete an employee
  async remove(id: string) {
    await this.employeesRepository.delete(id);
    return { deleted: true };
  }
}
