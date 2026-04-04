// File khai báo bảng, kiểu dữ liệu của từng column trong table và các mối quan hệ đối với bảng khác

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Exclude } from 'class-transformer';
import { Role } from 'src/common/enum/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  @Exclude() // Ẩn mật khẩu khi trả về JSON (cần ClassSerializerInterceptor)
  password: string;

  // Sử dụng enum để bắt buộc dữ liệu nhập vào DB chỉ có thể là USER, ADMIN , MANAGER
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User, // Ví dụ: 'ADMIN', 'USER', 'MANAGER'
  })
  role: Role;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  @Exclude() // Ẩn refresh token
  refreshToken: string;

  // --- QUAN HỆ 1-1 VỚI NHÂN VIÊN ---
  // Một User tài khoản sẽ gắn liền với một hồ sơ Nhân viên cụ thể
  @Column({ nullable: true })
  employeeId: string;

  @OneToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  // --- TRACKING ---
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
