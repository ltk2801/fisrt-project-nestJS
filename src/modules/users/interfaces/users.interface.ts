// tạo 1 interface để định nghĩa kiểu dữ liệu cho User, giúp chúng ta làm việc với dữ liệu dễ dàng hơn
// 1. Cái khung cơ bản nhất
export interface IuserBase {
  id: string;
  userName: string;
  password: string;
}

// 2. Dùng cho danh sách các user ( có thêm trạng thái hoạt động), Dùng kế thừa từ Cái khung cơ bản nhất
export interface IuserList extends IuserBase {
  isActive: boolean;
}
