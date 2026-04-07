import {
  StreamableFile,
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';
import {
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

// Import Auth
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/common/enum/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JobCreateDto } from './dto/job-create-dto';
import { FileInterceptor } from '@nestjs/platform-express';

import type { Response } from 'express';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // // Import File Excel to DB
  @ApiOperation({ summary: 'Import danh sach job tu file Excel' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ description: 'Import file Excel job thanh cong' })
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('import-data')
  async importData(@UploadedFile() file: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('Vui lòng tải lên file Excel hợp lệ');
    }

    return this.jobsService.importJobsFromExcel(file.buffer);
  }

  // Export Data to Excel
  @ApiOperation({ summary: 'Export danh sach job ra file Excel' })
  @ApiBearerAuth('access-token')
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Danh sach field can export, cach nhau boi dau phay',
    example: 'id,title,minSalary,maxSalary,isActive',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Trang du lieu can export',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'So ban ghi trong moi trang khi export',
    example: 20,
  })
  @ApiOkResponse({
    description: 'Tra ve file Excel danh sach job',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @UseGuards(AuthGuard)
  @Get('export-data')
  async exportData(
    // Neu khong co bat cu query nao gui vao thi se export all du lieu
    @Query('fields') fields: string, // Client gui ?fields = id,name hoac ?fiedls = name,des de export duoc dung du lieu
    @Query('page') page: number, // Neu muon lay du lieu tu page nao thi nhap vao day
    @Query('limit') limit: number, // So dong du lieu trong 1 trang muon lay
    @Res({ passthrough: true }) res: Response,
  ) {
    const fileStream = await this.jobsService.exportJobssToExcel(
      fields,
      page,
      limit,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="jobs.xlsx"');
    return new StreamableFile(fileStream);
  }
  // Get all jobs
  @ApiOperation({ summary: 'Lay danh sach job' })
  @ApiOkResponse({ description: 'Lay danh sach job thanh cong' })
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  // Get a single job by id
  @ApiOperation({ summary: 'Lay chi tiet mot job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiOkResponse({ description: 'Lay chi tiet job thanh cong' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  // Create a new job
  @ApiOperation({ summary: 'Tao job moi' })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: Job })
  @ApiOkResponse({ description: 'Tao job thanh cong' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('create-job')
  create(@Body() job: JobCreateDto) {
    return this.jobsService.createJob(job);
  }

  // Update a job
  @ApiOperation({ summary: 'Cap nhat job' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiBody({ type: Job })
  @ApiOkResponse({ description: 'Cap nhat job thanh cong' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() job: Job) {
    return this.jobsService.update(id, job);
  }

  // Delete a job
  @ApiOperation({ summary: 'Xoa job' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiOkResponse({ description: 'Xoa job thanh cong' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
