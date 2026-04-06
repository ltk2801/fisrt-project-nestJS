import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Job } from './entities/job.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Import DTO
import { JobCreateDto } from './dto/job-create-dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
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
}
