import { JobImportDto } from '../dto/job-import-dto';
// job.transformer.ts
export class JobTransformer {
  static toDto(row: any): JobImportDto {
    return {
      title: String(row.title ?? '').trim(),
      minSalary: this.parseNumber(row.minSalary),
      maxSalary: this.parseNumber(row.maxSalary),
      isActive: this.parseBoolean(row.isActive),
    };
  }

  private static parseNumber(value: any): number {
    const num = Number(value);
    return Number.isNaN(num) ? 0 : num;
  }

  private static parseBoolean(value: any): boolean {
    if (value === null || value === undefined || String(value).trim() === '')
      return true;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).trim().toLowerCase();
    return ['true', '1', 'active', 'yes', 'co', 'on'].includes(normalized);
  }
}
