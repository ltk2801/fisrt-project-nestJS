import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { Job } from '../../jobs/entities/job.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  // Quan hệ: Nhiều nhân viên thuộc 1 phòng ban
  @ManyToOne(() => Department, (department) => department.employees)
  department: Department;

  // Quan hệ: Nhiều nhân viên làm cùng 1 công việc
  @ManyToOne(() => Job, (job) => job.employees)
  job: Job;
}
