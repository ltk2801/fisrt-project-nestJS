import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true, // Đảm bảo tên phòng ban là duy nhất ở cấp độ DB
    nullable: false, // Không được phép để trống tên
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true, // Mô tả có thể có hoặc không
  })
  description: string;

  @Column({
    type: 'boolean',
    default: true, // Trạng thái hoạt động của phòng ban
  })
  isActive: boolean;

  // --- QUAN HỆ ---
  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];

  // --- TRACKING (Giúp bạn quản lý dữ liệu tốt hơn) ---
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' }) // Hỗ trợ Soft Delete (Xóa ảo)
  deletedAt: Date;
}
