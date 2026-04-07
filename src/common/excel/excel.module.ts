import { Module, Global } from '@nestjs/common';
import { ExcelExportService } from './excel.export.service';
import { ExcelImportService } from './excel.import.service';

@Global()
@Module({
  providers: [ExcelExportService, ExcelImportService],
  exports: [ExcelExportService, ExcelImportService],
})
export class ExcelModule {}
