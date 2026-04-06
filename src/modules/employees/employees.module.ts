import { forwardRef, Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { AuthModule } from '../auth/auth.module';
import { DepartmentsModule } from '../departments/departments.module';
import { JobsModule } from '../jobs/jobs.module';
import { UsersModule } from '../users/users.module';
import { IsUniqueConstraint } from 'src/common/pipes/is-unique.validator';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([Employee]),
    DepartmentsModule,
    JobsModule,
    UsersModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, IsUniqueConstraint],
  exports: [EmployeesService],
})
export class EmployeesModule {}
