import { Injectable } from '@nestjs/common';
import { Department } from './entities/department.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// import các Data Transfer Object (DTO) để có thể sử dụng trong service
import { DepartmentCreateDto } from './dto/department-create-dto';
import { DepartmentUpdateDto } from './dto/department-update-dto';

// import các interface mình vừa tạo để có thể sử dụng gửi dữ liệu về cho FE
import {
  IDepartmentBase,
  IDepartmentList,
} from './interfaces/department.interface';
import { ExcelExportService } from 'src/common/excel/excel.export.service';

@Injectable()
export class DepartmentsService {
  // Cái này là để khai báo repository của TypeORM để có thể làm việc với database thông qua entity Department
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    private excelExportService: ExcelExportService,
  ) {}

  // Các phương thức để làm việc với dữ liệu phòng ban, sẽ được gọi từ controller
  // Khi FE chỉ cần lấy dữ liệu là id và name của phòng ban
  async getSelectOptions(): Promise<IDepartmentBase[]> {
    // TypeORM sẽ tự hiểu trả về mảng có cấu trúc của IDepartmentBase
    return await this.departmentsRepository.find({
      select: ['id', 'name'],
    });
  }

  // GET ALL DEPARTMENTS bao gồm ID,NAME kế thừa từ interfaceBase + thêm active
  async getAllDepartmentsActive(): Promise<IDepartmentList[]> {
    // TypeORM sẽ tự hiểu trả về mảng có cấu trúc của IDepartmentList
    return await this.departmentsRepository.find({
      select: ['id', 'name', 'description'],
    });
  }

  // GET ALL DEPARTMENTS WITH FULL INFO
  async getAllDepartments(): Promise<Department[]> {
    return await this.departmentsRepository.find();
  }

  // create a new department use DTO
  createDepartment(department: DepartmentCreateDto) {
    return this.departmentsRepository.save(department);
  }

  // Ví dụ khi muốn truy xuất thông tin của 1 phòng ban thì bình thường chúng ta sẽ làm như vạy
  // find a department by id  s
  findOne(id: string) {
    return this.departmentsRepository.findOneBy({ id });
  }
  // update a department
  async update(id: string, department: DepartmentUpdateDto) {
    await this.departmentsRepository.update(id, department);
    return this.departmentsRepository.findOneBy({ id });
  }
  // delete a department
  async remove(id: string) {
    await this.departmentsRepository.delete(id);
    return { deleted: true };
  }

  // Export data department to excel

  async exportDepartmentsToExcel() {
    // Lấy dữ liệu từ DB
    const departments = await this.departmentsRepository.find({
      select: ['id', 'name', 'description', 'isActive'],
    });
    // Chuyển đổi dữ liệu lấy về thành header,key,value
    const excelColumns =
      this.excelExportService.autoGenerateColumns(departments);

    // Gọi service export file excel
    return this.excelExportService.generateExcelStream(
      excelColumns,
      departments,
    );
  }
}
