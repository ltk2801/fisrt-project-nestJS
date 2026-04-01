import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/modules/employees/entities/employee.entity';
import { Department } from 'src/modules/departments/entities/department.entity';
import { Job } from 'src/modules/jobs/entities/job.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'pg-3885965-personnel-management.e.aivencloud.com',
      port: 24880,
      username: 'avnadmin',
      password: process.env.DATABASE_PASSWORD,
      database: 'defaultdb',
      ssl: { rejectUnauthorized: false },
      entities: [Employee, Department, Job],
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
  exports: [TypeOrmModule], // Export để các module khác có thể dùng Repository
})
export class DatabaseModule {}
