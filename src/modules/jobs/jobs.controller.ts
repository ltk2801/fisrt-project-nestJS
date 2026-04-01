import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // Get all jobs
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  // Get a single job by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  // Create a new job
  @Post()
  create(@Body() job: Job) {
    return this.jobsService.create(job);
  }

  // Update a job
  @Patch(':id')
  update(@Param('id') id: string, @Body() job: Job) {
    return this.jobsService.update(id, job);
  }

  // Delete a job
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
