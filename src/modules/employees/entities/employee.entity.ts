import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { Job } from '../../jobs/entities/job.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // --- QUAN HỆ VÀ KHÓA NGOẠI ---

  @Column({ nullable: true })
  departmentId: string;

  @ManyToOne(() => Department, (dept) => dept.employees, {
    onDelete: 'SET NULL', // Nếu xóa phòng ban, nhân viên này sẽ để trống phòng ban thay vì bị xóa theo
  })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ nullable: true })
  jobId: string;

  @ManyToOne(() => Job, (job) => job.employees, {
    onDelete: 'RESTRICT', // Không cho phép xóa Job nếu vẫn còn nhân viên đang làm job đó
  })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  // --- TRACKING ---

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
