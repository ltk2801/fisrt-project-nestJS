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
        'employee.firstName AS employee_firstName',
        'employee.lastName AS employee_lastName',
        'employee.email AS employee_email',
        'employee.phoneNumber AS employee_phoneNumber',
        'employee.hireDate AS employee_hireDate',
        'employee.isActive AS employee_isActive',
        'department.id AS department_id',
        'department.name AS department_name',
        'department.description AS department_description',
        'department.isActive AS department_isActive',
        'job.id AS job_id',
        'job.title AS job_title',
        'job.minSalary AS job_minSalary',
        'job.maxSalary AS job_maxSalary',
        'job.isActive AS job_isActive',
        'user.id AS user_id',
        'user.username AS user_username',
        'user.role AS user_role',
        'user.isActive AS user_isActive',
      ])
      .where('employee.id = :id', { id })
      .getRawOne();

    if (!employeeDetail) {
      throw new BadRequestException(`Không tìm thấy nhân viên`);
    }

    const firstName = employeeDetail.employee_firstname ?? null;
    const lastName = employeeDetail.employee_lastname ?? null;
    const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();

    return {
      employee: {
        id: employeeDetail.employee_id,
        firstName,
        lastName,
        fullName,
        email: employeeDetail.employee_email ?? null,
        phoneNumber: employeeDetail.employee_phonenumber ?? null,
        hireDate: employeeDetail.employee_hiredate ?? null,
        isActive: Boolean(employeeDetail.employee_isactive),
      },
      department: employeeDetail.department_id
        ? {
            id: employeeDetail.department_id,
            name: employeeDetail.department_name,
            description: employeeDetail.department_description ?? null,
            isActive: Boolean(employeeDetail.department_isactive),
          }
        : null,
      job: employeeDetail.job_id
        ? {
            id: employeeDetail.job_id,
            title: employeeDetail.job_title,
            minSalary: Number(employeeDetail.job_minsalary),
            maxSalary: Number(employeeDetail.job_maxsalary),
            isActive: Boolean(employeeDetail.job_isactive),
          }
        : null,
      account: employeeDetail.user_id
        ? {
            id: employeeDetail.user_id,
            username: employeeDetail.user_username,
            role: employeeDetail.user_role,
            isActive: Boolean(employeeDetail.user_isactive),
          }
        : null,
    };
  }

  // Export data employees to excel
  async exportFullInfoEmployeeToExcel(
    fields?: string,
    page?: number,
    limit?: number,
  ) {
    // Dinh nghia danh sach cac cot hop le ma DB co ma khi client gui lai phai dung thong tin can
    // Ánh xạ field giống với column trong db
    const EMPLOYEE_EXPORT_MAP = {
      employeeId: 'employee.id',
      fullName: "CONCAT(employee.lastName, ' ', employee.firstName)",
      email: 'employee.email',
      phoneNumber: 'employee.phoneNumber',
      hireDate: "TO_CHAR(employee.hireDate, 'DD/MM/YYYY')",
      departId: 'department.id',
      departName: 'department.name',
      jobId: 'job.id',
      jobTitle: 'job.title',
      accountId: 'user.id',
      username: 'user.username',
    };
    const validFields = Object.keys(EMPLOYEE_EXPORT_MAP);
    // Su dung ham
    const findOptions = await this.excelExportService.optionsPagination(
      fields,
      page,
      limit,
      validFields,
    );

    // Khởi tạo 1 QueryBuilder với các bản join
    const query = this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoin(User, 'user', 'employee.id = user.employeeId')
      .leftJoin('employee.job', 'job')
      .leftJoin('employee.department', 'department')
      .select([]);
    // Thứ tự chuẩn để export ra file
    const EXPORT_ORDER = [
      'employeeId',
      'fullName',
      'email',
      'phoneNumber',
      'hireDate',
      'departId',
      'departName',
      'jobId',
      'jobTitle',
      'accountId',
      'username',
    ];
    // Sắp xếp lại thứ tự
    const sortedSelect = findOptions.select.sort((a, b) => {
      return EXPORT_ORDER.indexOf(a) - EXPORT_ORDER.indexOf(b);
    });
    // 3. Apply SELECT từ options (Sử dụng Mapping)
    sortedSelect.forEach((field: string) => {
      const dbColumn = EMPLOYEE_EXPORT_MAP[field];
      if (dbColumn) {
        query.addSelect(dbColumn, field); // 'field' ở đây đóng vai trò là Alias (tên cột trong Excel)
      }
    });

    // // 4. Apply Order, Take, Skip
    query.orderBy('employee.id', 'ASC');

    if (findOptions.take) query.limit(findOptions.take);
    if (findOptions.skip) query.offset(findOptions.skip);

    // 5. Lấy dữ liệu dạng Raw (Phẳng)
    const employees = await query.getRawMany();
    // Chuyển đổi dữ liệu lấy về thành header,key,value
    const excelColumns = this.excelExportService.autoGenerateColumns(employees);

    // Gọi service export file excel
    return this.excelExportService.generateExcelStream(excelColumns, employees);
  }
}
