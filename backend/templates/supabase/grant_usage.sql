-- 1. Cho phép API "nhìn thấy" schema này
-- thay test bằng tên schema muốn grant

GRANT USAGE ON SCHEMA test TO anon, authenticated, service_role;

-- 2. Cho phép đọc/ghi dữ liệu trên tất cả các BẢNG đang có
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA test TO anon, authenticated, service_role;

-- 3. Cho phép sử dụng các ID tự tăng (Sequences)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA test TO anon, authenticated, service_role;

-- 4. TỰ ĐỘNG cấp quyền cho các bảng bạn sẽ tạo trong tương lai
-- (Để sau này tạo bảng mới không phải chạy lại lệnh GRANT nữa)
ALTER DEFAULT PRIVILEGES IN SCHEMA test GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA test GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;