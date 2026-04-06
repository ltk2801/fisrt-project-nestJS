import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ColumnNumericTransformer } from 'src/common/pipes/transfrom-string-to-number';

@Entity('jobs')
export class Job {
  @ApiPropertyOptional({
    example: '5de69b40-0f09-43dc-bdd7-d481c56b5c2a',
    description: 'ID cua job',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Backend Developer',
    description: 'Ten chuc danh cong viec',
  })
  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  title: string; // Ví dụ: Backend Developer, HR Manager

  @ApiProperty({
    example: 6000000,
    description: 'Muc luong toi thieu (VND) ',
  })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 0,
    transformer: new ColumnNumericTransformer(),
  })
  minSalary: number;

  @ApiProperty({
    example: 20000000,
    description: 'Muc luong toi da (VND)',
  })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 0,
    transformer: new ColumnNumericTransformer(),
  })
  maxSalary: number;

  @ApiProperty({
    example: true,
    description: 'Trang thai hoat dong cua job',
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Employee, (employee) => employee.job)
  employees: Employee[];

  // TRACKING

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleteAt' })
  deleteAt: Date;
}
