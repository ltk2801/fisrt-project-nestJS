import { BadRequestException, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface ExcelImportError {
  rowNumber: number;
  messages: string[];
  rawData: Record<string, unknown>;
}

export interface ExcelImportResult<T> {
  headers: string[];
  rows: T[];
  errors: ExcelImportError[];
  totalRows: number;
  successCount: number;
  errorCount: number;
}

export interface ExcelImportContext {
  rowNumber: number;
  headers: string[];
}

export interface ExcelImportOptions<T> {
  validFields: string[];
  fieldLabels?: Record<string, string>;
  requiredFields?: string[];
  sheetName?: string;
  headerRowNumber?: number;
  startRowNumber?: number;
  strictHeaders?: boolean;
  skipEmptyRows?: boolean;
  trimStrings?: boolean;
  valueTransformers?: Record<
    string,
    (value: unknown, context: ExcelImportContext) => unknown
  >;
  rowTransformer?: (
    row: Record<string, unknown>,
    context: ExcelImportContext,
  ) => T | Promise<T>;
  rowValidator?: (
    row: Record<string, unknown>,
    context: ExcelImportContext,
  ) => string[] | Promise<string[]>;
}

@Injectable()
export class ExcelImportService {
  private readonly defaultFieldLabels: Record<string, string> = {
    employeeId: 'Mã nhân viên',
    fullName: 'Họ và Tên',
    email: 'Email',
    phoneNumber: 'Số điện thoại',
    departName: 'Phòng ban',
    hireDate: 'Ngày vào làm việc',
    accountId: 'Mã tài khoản',
    username: 'Tên đăng nhập',
    jobId: 'Mã chức vụ',
    departId: 'Mã phòng ban',
    jobTitle: 'Tên chức vụ',
  };

  private normalizeHeader(value: unknown): string {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  private getCellValue(cell: ExcelJS.Cell): unknown {
    const { value } = cell;

    if (value === null || value === undefined) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'object') {
      if ('text' in value) {
        return value.text;
      }

      if ('result' in value) {
        return value.result ?? null;
      }

      if ('richText' in value) {
        return value.richText.map((item) => item.text).join('');
      }

      if ('hyperlink' in value) {
        const hyperlinkValue = value as { text?: string; hyperlink: string };
        return hyperlinkValue.text ?? hyperlinkValue.hyperlink;
      }
    }

    return value;
  }

  private isRowEmpty(values: Record<string, unknown>): boolean {
    return Object.values(values).every(
      (value) => value === null || value === undefined || value === '',
    );
  }

  private buildAcceptedHeaders(
    validFields: string[],
    fieldLabels?: Record<string, string>,
  ): Map<string, string> {
    const acceptedHeaders = new Map<string, string>();
    const labels = {
      ...this.defaultFieldLabels,
      ...(fieldLabels ?? {}),
    };

    validFields.forEach((field) => {
      acceptedHeaders.set(this.normalizeHeader(field), field);

      const label = labels[field];
      if (label) {
        acceptedHeaders.set(this.normalizeHeader(label), field);
      }
    });

    return acceptedHeaders;
  }

  async importFromBuffer<T = Record<string, unknown>>(
    fileBuffer: Buffer,
    options: ExcelImportOptions<T>,
  ): Promise<ExcelImportResult<T>> {
    if (!fileBuffer?.length) {
      throw new BadRequestException('File Excel không hợp lệ hoặc đang trống');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = options.sheetName
      ? workbook.getWorksheet(options.sheetName)
      : workbook.worksheets[0];

    if (!worksheet) {
      throw new BadRequestException('Không tìm thấy sheet dữ liệu trong file');
    }

    const headerRowNumber = options.headerRowNumber ?? 1;
    const startRowNumber = options.startRowNumber ?? headerRowNumber + 1;
    const skipEmptyRows = options.skipEmptyRows ?? true;
    const trimStrings = options.trimStrings ?? true;
    const strictHeaders = options.strictHeaders ?? false;
    const acceptedHeaders = this.buildAcceptedHeaders(
      options.validFields,
      options.fieldLabels,
    );

    const headerRow = worksheet.getRow(headerRowNumber);
    const headers: string[] = [];
    const columnFieldMap = new Map<number, string>();

    headerRow.eachCell((cell, colNumber) => {
      const rawHeader = String(this.getCellValue(cell) ?? '').trim();
      if (!rawHeader) {
        return;
      }

      headers.push(rawHeader);
      const normalizedHeader = this.normalizeHeader(rawHeader);
      const field = acceptedHeaders.get(normalizedHeader);

      if (field) {
        columnFieldMap.set(colNumber, field);
      }
    });

    if (columnFieldMap.size === 0) {
      throw new BadRequestException(
        'Không tìm thấy cột hợp lệ nào trong file Excel',
      );
    }

    const missingRequiredFields = (options.requiredFields ?? []).filter(
      (field) => !Array.from(columnFieldMap.values()).includes(field),
    );

    if (missingRequiredFields.length > 0) {
      throw new BadRequestException(
        `Thiếu cột bắt buộc: ${missingRequiredFields.join(', ')}`,
      );
    }

    if (strictHeaders) {
      const unknownHeaders = headers.filter((header) => {
        return !acceptedHeaders.has(this.normalizeHeader(header));
      });

      if (unknownHeaders.length > 0) {
        throw new BadRequestException(
          `File chứa cột không hợp lệ: ${unknownHeaders.join(', ')}`,
        );
      }
    }

    const rows: T[] = [];
    const errors: ExcelImportError[] = [];

    for (
      let rowNumber = startRowNumber;
      rowNumber <= worksheet.rowCount;
      rowNumber++
    ) {
      const worksheetRow = worksheet.getRow(rowNumber);
      const rawData: Record<string, unknown> = {};

      columnFieldMap.forEach((field, colNumber) => {
        const rawValue = this.getCellValue(worksheetRow.getCell(colNumber));
        rawData[field] =
          trimStrings && typeof rawValue === 'string' ? rawValue.trim() : rawValue;
      });

      if (skipEmptyRows && this.isRowEmpty(rawData)) {
        continue;
      }

      const context: ExcelImportContext = {
        rowNumber,
        headers,
      };

      const transformedRow =
        Object.entries(rawData).reduce<Record<string, unknown>>(
          (result, [field, value]) => {
            const transformer = options.valueTransformers?.[field];
            result[field] = transformer ? transformer(value, context) : value;
            return result;
          },
          {},
        );

      const rowErrors = [
        ...(await Promise.resolve(
          options.rowValidator?.(transformedRow, context) ?? [],
        )),
      ];

      if (rowErrors.length > 0) {
        errors.push({
          rowNumber,
          messages: rowErrors,
          rawData: transformedRow,
        });
        continue;
      }

      const finalRow = options.rowTransformer
        ? await options.rowTransformer(transformedRow, context)
        : (transformedRow as T);

      rows.push(finalRow);
    }

    return {
      headers,
      rows,
      errors,
      totalRows: rows.length + errors.length,
      successCount: rows.length,
      errorCount: errors.length,
    };
  }
}
