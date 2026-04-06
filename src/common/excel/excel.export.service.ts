import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PassThrough } from 'stream';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

@Injectable()
export class ExcelExportService {
  private calculateColumnWidth(
    header: string,
    data: any[],
    key: string,
  ): number {
    const maxContentLength = data.reduce((max, item) => {
      const value = item?.[key];

      if (value === null || value === undefined) {
        return max;
      }

      return Math.max(max, String(value).length);
    }, header.length);

    return Math.min(Math.max(maxContentLength + 4, 14), 40);
  }

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
        size: 12,
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
      row.height = 22;

      row.eachCell((cell) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
        cell.font = {
          name: 'Calibri',
          size: 11,
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
      header: key.toUpperCase(),
      key: key,
      width: 20,
    }));
  }
}
