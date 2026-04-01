import { Injectable } from '@nestjs/common';
import { Job } from './entities/job.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}
  // get all jobs
  findAll() {
    return this.jobsRepository.find();
  }
  // create a new job
  create(job: Job) {
    return this.jobsRepository.save(job);
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
