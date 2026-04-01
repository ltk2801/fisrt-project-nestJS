import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
  unique: true;

  // 1 phòng ban có thể có nhiều nhân viên ( 1 to many )

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
}
