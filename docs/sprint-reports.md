# Báo cáo tiến độ Sprint (Sprint Reports) - Book Hive

Lộ trình dự án được chia thành 6 Sprint, mỗi Sprint kéo dài 2 tuần.

## Sprint 1: Khởi tạo & Cấu hình UI Base
- **Mục tiêu**: Setup dự án, kiến trúc base, routing và design system.
- **Kết quả**: 
    - [x] Khởi tạo Next.js frontend & Node.js backend.
    - [x] Thiết lập cấu trúc thư mục chuẩn.
    - [x] Cấu hình Tailwind CSS, Ant Design/Shadcn UI.
    - [x] Setup các route cơ bản.

## Sprint 2: Xác thực & Phân quyền
- **Mục tiêu**: Hoàn thiện hệ thống Auth (Login/Register) cho cả User và Admin.
- **Kết quả**:
    - [x] API Đăng ký/Đăng nhập với JWT.
    - [x] Middleware bảo vệ route.
    - [x] Trang Profile cá nhân.
    - [x] Tích hợp Google OAuth.

## Sprint 3: Module Sản phẩm & Media
- **Mục tiêu**: Xây dựng CRUD cho Books, Categories và tính năng upload ảnh.
- **Kết quả**:
    - [x] API & Giao diện quản lý sách (Admin).
    - [x] Tích hợp Cloudinary upload.
    - [x] Hiển thị danh sách sách ở trang chủ Client.

## Sprint 4: Giỏ hàng, Tìm kiếm & Lọc
- **Mục tiêu**: Hoàn thiện luồng mua hàng và bộ lọc tìm kiếm nâng cao.
- **Kết quả**:
    - [x] Tính năng Giỏ hàng (Cart).
    - [x] Tìm kiếm theo từ khóa (Debounce).
    - [x] Lọc sách theo danh mục, giá, đánh giá.
    - [x] Phân trang (Pagination).

## Sprint 5: Thanh toán & Dashboard
- **Mục tiêu**: Tích hợp thanh toán trực tuyến và hiển thị biểu đồ thống kê.
- **Kết quả**:
    - [x] Tích hợp cổng thanh toán PayOS.
    - [x] Trang Dashboard Admin với biểu đồ doanh thu (Recharts/Chart.js).
    - [x] Tối ưu SEO & Metadata.
    - [x] Tích hợp Chatbot AI tư vấn.

## Sprint 6: Testing & Hoàn thiện
- **Mục tiêu**: Kiểm thử, sửa lỗi, hoàn thiện tài liệu và deploy.
- **Kết quả**:
    - [ ] Viết Unit Test và Integration Test.
    - [ ] Optimize hiệu năng (Image, Lazy Loading).
    - [x] Deploy lên Vercel/Cloudflare.
    - [x] Hoàn thiện tài liệu README, ERD, API Spec.
