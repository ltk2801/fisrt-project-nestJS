import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PassThrough } from 'stream';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

@Injectable()
export class ExcelExportService {
  private formatCellValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private calculateColumnWidth(
    header: string,
    data: any[],
    key: string,
  ): number {
    const maxContentLength = data.reduce((max, item) => {
      const cellValueLength = this.formatCellValue(item?.[key]).length;
      return Math.max(max, cellValueLength);
    }, header.length);

    return Math.min(Math.max(maxContentLength + 4, 14), 40);
  }

  private FIELD_LABELS = {
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

  /**
   * Tạo stream Excel dựa trên cột và dữ liệu tùy chỉnh
   */
  async generateExcelStream(
    columns: ExcelColumn[],
    data: any[],
  ): Promise<PassThrough> {
    const passThrough = new PassThrough();

    // Khởi tạo WorkbookWriter để stream dữ liệu
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: passThrough,
      useStyles: true, // Cho phép định dạng (bold, color...)
      useSharedStrings: true,
    });

    const worksheet = workbook.addWorksheet('Data', {
      properties: { defaultRowHeight: 22 },
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    // Gán cấu hình cột
    worksheet.columns = columns.map((column) => ({
      ...column,
      width:
        column.width ??
        this.calculateColumnWidth(column.header, data, column.key),
      style: {
        font: {
          name: 'Calibri',
          size: 11,
          color: { argb: 'FF1F2937' },
        },
        alignment: {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        },
        border: {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        },
      },
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: 'Calibri',
        size: 15,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1D4ED8' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF93C5FD' } },
        left: { style: 'thin', color: { argb: 'FF93C5FD' } },
        bottom: { style: 'thin', color: { argb: 'FF93C5FD' } },
        right: { style: 'thin', color: { argb: 'FF93C5FD' } },
      };
    });
    headerRow.commit();

    // Duyệt dữ liệu và commit từng dòng để tiết kiệm RAM
    data.forEach((item, index) => {
      const row = worksheet.addRow(item);
      row.height = 24;
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
        cell.font = {
          name: 'Calibri',
          size: 14,
          color: { argb: 'FF111827' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: index % 2 === 0 ? 'FFF9FAFB' : 'FFFFFFFF' },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });

      row.commit();
    });

    // Kết thúc workbook
    await workbook.commit();

    return passThrough;
  }

  /* Tạo 1 service để auto Generate Column theo những gì truyền vào , trả về mảng đối tượng như interface */
  autoGenerateColumns(data: any[]): ExcelColumn[] {
    if (!data || data.length === 0) return [];

    // Chỉ lấy những key mà giá trị của nó KHÔNG phải là undefined hoặc null
    const firstItem = data[0];
    const validKeys = Object.keys(firstItem).filter(
      (key) => firstItem[key] !== undefined,
    );
    return validKeys.map((key) => ({
      header: this.FIELD_LABELS[key] || key.toUpperCase(),
      key: key,
    }));
  }

  /* Tạo 1 service để phân trang và chọn theo options của client để export */
  optionsPagination(
    fields?: string,
    page?: number,
    limit?: number,
    validFields?: any[],
  ) {
    //  Xác định các keys cần xuất ( Nếu client không gửi thì lấy tất cả )
    let selectedFields: any[] = validFields;
    if (fields) {
      // Tách chuỗi, lọc bỏ khoảng trắng và chỉ giữ lại những field nằm trong validFields
      const requestedFields = fields.split(',').map((f) => f.trim());
      const filteredFields = requestedFields.filter((f) =>
        validFields.includes(f),
      );
      // Nếu sau khi lọc vẫn còn ít nhất 1 field đúng thì mới ghi đè
      if (filteredFields.length > 0) {
        selectedFields = filteredFields;
      }
    }
    // Lấy dữ liệu từ DB
    const findOptions: any = {
      select: selectedFields,
      order: { id: 'ASC' },
    };
    // neu co page va limit, co nghia la muon phan trang =>
    if (page && limit) {
      findOptions.take = limit;
      findOptions.skip = (page - 1) * limit;
    }
    return findOptions;
  }
}
