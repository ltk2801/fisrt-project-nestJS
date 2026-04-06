export interface IDepartmentBase {
  id: string;
  name: string;
}

// Thêm một interface trung gian cho các thuộc tính chung của UI
export interface IDepartmentStatus extends IDepartmentBase {
  isActive: boolean;
}

// Kế thừa lại
export interface IDepartmentList extends IDepartmentStatus {}

export interface IDepartmentDetail extends IDepartmentStatus {
  description: string;
}
