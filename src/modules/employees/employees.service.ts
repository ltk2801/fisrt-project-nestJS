import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Employee } from './entities/employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';

// Import DTO
import { UpdateEmployeeDto } from './dto/update-employee.dto';

// Import Interface
import { IEmployeeDetailResponse } from './interfaces/employees.interface';

// Import service
import { JobsService } from '../jobs/jobs.service';
import { DepartmentsService } from '../departments/departments.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/users.entity';

/////////
import { ExcelExportService } from 'src/common/excel/excel.export.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    private readonly jobsService: JobsService,
    private readonly departmentsService: DepartmentsService,
    private readonly usersService: UsersService,
    private readonly excelExportService: ExcelExportService,
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

  // *************************** GET FULL INFO EMPLOYEE
  async getEmployeeDetails(id: string): Promise<IEmployeeDetailResponse> {
    const employeeDetail = await this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoin('employee.job', 'job')
      .leftJoin('employee.department', 'department')
      .leftJoin(User, 'user', 'user.employeeId = employee.id')
      .select([
        'employee.id AS employee_id',
        'employee.firstName AS employee_first_name',
        'employee.lastName AS employee_last_name',
        'employee.email AS employee_email',
        'employee.phoneNumber AS employee_phone_number',
        'employee.hireDate AS employee_hire_date',
        'employee.isActive AS employee_is_active',
        'department.id AS department_id',
        'department.name AS department_name',
        'department.description AS department_description',
        'department.isActive AS department_is_active',
        'job.id AS job_id',
        'job.title AS job_title',
        'job.minSalary AS job_min_salary',
        'job.maxSalary AS job_max_salary',
        'job.isActive AS job_is_active',
        'user.id AS user_id',
        'user.username AS user_username',
        'user.role AS user_role',
        'user.isActive AS user_is_active',
      ])
      .where('employee.id = :id', { id })
      .getRawOne();

    if (!employeeDetail) {
      throw new BadRequestException(`Không tìm thấy nhân viên`);
    }

    const firstName = employeeDetail.employee_first_name ?? null;
    const lastName = employeeDetail.employee_last_name ?? null;
    const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();

    return {
      employee: {
        id: employeeDetail.employee_id,
        firstName,
        lastName,
        fullName,
        email: employeeDetail.employee_email ?? null,
        phoneNumber: employeeDetail.employee_phone_number ?? null,
        hireDate: employeeDetail.employee_hire_date ?? null,
        isActive: Boolean(employeeDetail.employee_is_active),
      },
      department: employeeDetail.department_id
        ? {
            id: employeeDetail.department_id,
            name: employeeDetail.department_name,
            description: employeeDetail.department_description ?? null,
            isActive: Boolean(employeeDetail.department_is_active),
          }
        : null,
      job: employeeDetail.job_id
        ? {
            id: employeeDetail.job_id,
            title: employeeDetail.job_title,
            minSalary: Number(employeeDetail.job_min_salary),
            maxSalary: Number(employeeDetail.job_max_salary),
            isActive: Boolean(employeeDetail.job_is_active),
          }
        : null,
      account: employeeDetail.user_id
        ? {
            id: employeeDetail.user_id,
            username: employeeDetail.user_username,
            role: employeeDetail.user_role,
            isActive: Boolean(employeeDetail.user_is_active),
          }
        : null,
    };
  }

  // Export data employees to excel

  // async exportDepartmentsToExcel(
  //   fields?: string,
  //   page?: number,
  //   limit?: number,
  // ) {
  //   // Dinh nghia danh sach cac cot hop le ma DB co
  //   const validFields = ['id', 'isActive', 'name', 'description'];
  //   //  Xác định các keys cần xuất ( Nếu client không gửi thì lấy tất cả )
  //   let selectedFields: any[] = validFields;
  //   if (fields) {
  //     // Tách chuỗi, lọc bỏ khoảng trắng và chỉ giữ lại những field nằm trong validFields
  //     const requestedFields = fields.split(',').map((f) => f.trim());
  //     const filteredFields = requestedFields.filter((f) =>
  //       validFields.includes(f),
  //     );

  //     // Nếu sau khi lọc vẫn còn ít nhất 1 field đúng thì mới ghi đè
  //     if (filteredFields.length > 0) {
  //       selectedFields = filteredFields;
  //     }
  //   }

  //   // Lấy dữ liệu từ DB
  //   const findOptions: any = {
  //     select: selectedFields,
  //     order: { id: 'ASC' },
  //   };
  //   // neu co page va limit, co nghia la muon phan trang =>
  //   if (page && limit) {
  //     findOptions.take = limit;
  //     findOptions.skip = (page - 1) * limit;
  //   }
  //   const departments = await this.departmentsRepository.find(findOptions);
  //   // Chuyển đổi dữ liệu lấy về thành header,key,value
  //   const excelColumns =
  //     this.excelExportService.autoGenerateColumns(departments);

  //   // Gọi service export file excel
  //   return this.excelExportService.generateExcelStream(
  //     excelColumns,
  //     departments,
  //   );
  // }
}
