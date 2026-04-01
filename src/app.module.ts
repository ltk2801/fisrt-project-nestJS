import { Module } from '@nestjs/common';
import { EmployeesModule } from './modules/employees/employees.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, EmployeesModule, DepartmentsModule, JobsModule],
  controllers: [],
})
export class AppModule {}
