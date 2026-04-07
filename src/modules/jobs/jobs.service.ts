import { BadRequestException, Injectable } from '@nestjs/common';
import { Job } from './entities/job.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Import DTO
import { JobCreateDto } from './dto/job-create-dto';
import { ExcelExportService } from 'src/common/excel/excel.export.service';
import { ExcelImportService } from 'src/common/excel/excel.import.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    private readonly excelExportServices: ExcelExportService,
    private readonly excelImportService: ExcelImportService,
  ) {}
  // Check Min & Max Salary
  private async validateSalary(minSalary?: number, maxSalary?: number) {
    return minSalary <= maxSalary ? true : false;
  }

  // get all jobs
  findAll() {
    return this.jobsRepository.find();
  }
  //  *************** create a new job
  async createJob(job: JobCreateDto) {
    const checkSalary = await this.validateSalary(job.minSalary, job.maxSalary);
    if (!checkSalary) {
      throw new BadRequestException(
        'Mức lương tối thiểu phải bé hơn hoặc bằng mức lương tối đa',
      );
    }
    await this.jobsRepository.save(job);
    return {
      message: 'Create a new job successfull',
    };
  }
  // find a job by id
  findOne(id: string) {
    return this.jobsRepository.findOneBy({ id });
  }
  // update a job
  async update(id: string, job: Job) {
    await this.jobsRepository.update(id, job);
    return this.jobsRepository.findOneBy({ id });
  }
  // delete a job
  async remove(id: string) {
    await this.jobsRepository.delete(id);
    return { deleted: true };
  }
  // Export data jobs to excel

  async exportJobssToExcel(fields?: string, page?: number, limit?: number) {
    // Dinh nghia danh sach cac cot hop le ma DB co
    const validFields = ['id', 'minSalary', 'maxSalary', 'isActive', 'title'];

    // Su dung Ham lay ra field, phan trang
    const findOptions = await this.excelExportServices.optionsPagination(
      fields,
      page,
      limit,
      validFields,
    );

    const jobs = await this.jobsRepository.find(findOptions);

    // Chuyển đổi dữ liệu lấy về thành header,key,value
    const excelColumns = this.excelExportServices.autoGenerateColumns(jobs);

    // Gọi service export file excel
    return this.excelExportServices.generateExcelStream(excelColumns, jobs);
  }
  // ********* IMPORT Dữ liệu
  async importJobsFromExcel(fileBuffer: Buffer) {
    const existingJobs = await this.jobsRepository.find({
      select: ['title'],
    });
    const existingTitles = new Set(
      existingJobs.map((job) => job.title.trim().toLowerCase()),
    );
    const importedTitles = new Set<string>();

    const importResult =
      await this.excelImportService.importFromBuffer<JobCreateDto>(fileBuffer, {
        validFields: ['title', 'minSalary', 'maxSalary', 'isActive'],
        requiredFields: ['title'],
        fieldLabels: {
          title: 'Tên chức vụ',
          minSalary: 'Lương tối thiểu',
          maxSalary: 'Lương tối đa',
          isActive: 'Trạng thái',
        },
        valueTransformers: {
          title: (value) => String(value ?? '').trim(),
          minSalary: (value) => Number(value),
          maxSalary: (value) => Number(value),
          isActive: (value) => {
            if (
              value === null ||
              value === undefined ||
              String(value).trim() === ''
            ) {
              return true;
            }

            if (typeof value === 'boolean') {
              return value;
            }

            const normalizedValue = String(value).trim().toLowerCase();
            return ['true', '1', 'active', 'yes', 'co', 'on'].includes(
              normalizedValue,
            );
          },
        },
        rowValidator: async (row, context) => {
          const errors: string[] = [];
          const title = String(row.title ?? '').trim();
          const normalizedTitle = title.toLowerCase();
          const minSalary = Number(row.minSalary);
          const maxSalary = Number(row.maxSalary);

          if (!title) {
            errors.push('Tên chức vụ không được để trống');
          }

          if (title.length > 100) {
            errors.push('Tên chức vụ không được vượt quá 100 ký tự');
          }

          if (!Number.isFinite(minSalary) || minSalary < 0) {
            errors.push('Lương tối thiểu phải là số không âm');
          }

          if (!Number.isFinite(maxSalary) || maxSalary < 0) {
            errors.push('Lương tối đa phải là số không âm');
          }

          if (
            Number.isFinite(minSalary) &&
            Number.isFinite(maxSalary) &&
            minSalary > maxSalary
          ) {
            errors.push('Lương tối thiểu phải bé hơn hoặc bằng lương tối đa');
          }

          if (title && existingTitles.has(normalizedTitle)) {
            errors.push('Tên chức vụ đã tồn tại trong hệ thống');
          }

          if (title && importedTitles.has(normalizedTitle)) {
            errors.push('Tên chức vụ bị trùng trong file import');
          }

          if (errors.length === 0 && title) {
            importedTitles.add(normalizedTitle);
          }

          if (!('isActive' in row)) {
            row.isActive = true;
          }

          return errors.map(
            (message) => `Dòng ${context.rowNumber}: ${message}`,
          );
        },
        rowTransformer: (row) => ({
          title: String(row.title).trim(),
          minSalary: Number(row.minSalary),
          maxSalary: Number(row.maxSalary),
          isActive: Boolean(row.isActive),
        }),
      });

    if (importResult.rows.length > 0) {
      const jobs = this.jobsRepository.create(importResult.rows);
      await this.jobsRepository.save(jobs);
    }

    return {
      message:
        importResult.errorCount > 0
          ? 'Import job hoàn tất, có một số dòng không hợp lệ'
          : 'Import job thành công',
      summary: {
        totalRows: importResult.totalRows,
        successCount: importResult.successCount,
        errorCount: importResult.errorCount,
      },
      errors: importResult.errors,
    };
  }
}
