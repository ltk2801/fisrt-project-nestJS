-- 3. Tạo bảng departments
CREATE TABLE IF NOT EXISTS departments (
    -- Sử dụng UUID làm khóa chính
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tên phòng ban: Không trống, tối đa 100 ký tự, phải độc nhất
    name VARCHAR(100) NOT NULL UNIQUE,
    
    -- Mô tả phòng ban: Có thể trống
    description TEXT,
    
    -- Trạng thái: Mặc định là đang hoạt động
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Các trường quản lý thời gian (Audit Columns)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Dùng cho Soft Delete
);

-- Tạo bảng jobs
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tiêu đề công việc: Không trùng, không trống
    title VARCHAR(100) NOT NULL UNIQUE,
    
    -- Lương tối thiểu và tối đa: Dùng DECIMAL để tránh sai số tiền tệ
    min_salary DECIMAL(12, 2) DEFAULT 0,
    max_salary DECIMAL(12, 2) DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng employees
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Thông tin cá nhân
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    
    -- Email phải là duy nhất và không được trống
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    
    hire_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,

    -- KHÓA NGOẠI: Liên kết tới bảng departments
    department_id UUID,
    CONSTRAINT fk_employee_department 
        FOREIGN KEY(department_id) 
        REFERENCES departments(id) 
        ON DELETE SET NULL, -- Nếu xóa phòng ban, nhân viên vẫn tồn tại (null dept)

    -- KHÓA NGOẠI: Liên kết tới bảng jobs
    job_id UUID,
    CONSTRAINT fk_employee_job 
        FOREIGN KEY(job_id) 
        REFERENCES jobs(id) 
        ON DELETE RESTRICT, -- Không cho xóa Job nếu đang có nhân viên giữ chức vụ đó

    -- Các trường quản lý thời gian
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Dùng cho Soft Delete
);

-- Tạo bảng Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Độ dài 255 để chứa chuỗi đã Bcrypt hash
    role VARCHAR(20) DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    employee_id UUID UNIQUE, -- Đảm bảo 1 nhân viên chỉ có 1 tài khoản
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_user_employee 
        FOREIGN KEY(employee_id) 
        REFERENCES employees(id) 
        ON DELETE CASCADE
);