import { Role } from 'src/common/enum/role.enum';

export interface IEmployeeProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  hireDate: Date | null;
  isActive: boolean;
}

export interface IEmployeeDepartmentSummary {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface IEmployeeJobSummary {
  id: string;
  title: string;
  minSalary: number;
  maxSalary: number;
  isActive: boolean;
}

export interface IEmployeeAccountSummary {
  id: string;
  username: string;
  role: Role;
  isActive: boolean;
}

export interface IEmployeeDetailResponse {
  employee: IEmployeeProfile;
  department: IEmployeeDepartmentSummary | null;
  job: IEmployeeJobSummary | null;
  account: IEmployeeAccountSummary | null;
}
