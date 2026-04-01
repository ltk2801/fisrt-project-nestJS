import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  // 1 công việc có thể có nhiều nhân viên cùng làm ( 1 to many  )
  @OneToMany(() => Employee, (employee) => employee.job)
  employees: Employee[];
}
