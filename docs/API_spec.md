# API Specification - Book Hive

Phiên bản: 1.0.0
Base URL: `http://localhost:3001/api/v1`
Online Client: https://book-hive-project.vercel.app/home
Online Admin: https://book-hive-project.vercel.app/auth/admin/login

## 1. Authentication (Xác thực)

### Client Auth
- `POST /auth/register`: Đăng ký tài khoản người dùng.
- `POST /auth/login`: Đăng nhập người dùng.
- `POST /auth/password/forgot`: Quên mật khẩu.
- `POST /auth/password/reset`: Đặt lại mật khẩu.

### Admin Auth
- `POST /admin/auth/login`: Đăng nhập trang quản trị.

---

## 2. Books (Sách)

### Client
- `GET /books`: Danh sách sách (có filter, search, pagination).
- `GET /books/detail/:slug`: Chi tiết sách theo slug.
- `GET /books/featured`: Danh sách sách nổi bật.

### Admin
- `GET /admin/books`: Quản lý danh sách sách.
- `POST /admin/books/create`: Thêm sách mới.
- `PATCH /admin/books/edit/:id`: Chỉnh sửa thông tin sách.
- `DELETE /admin/books/delete/:id`: Xóa sách (Soft delete).

---

## 3. Categories (Danh mục)

### Admin
- `GET /admin/categories`: Danh sách danh mục.
- `POST /admin/categories/create`: Thêm danh mục.
- `PATCH /admin/categories/edit/:id`: Cập nhật danh mục.

---

## 4. Cart & Orders (Giỏ hàng & Đơn hàng)

### Client
- `GET /cart`: Xem giỏ hàng (Yêu cầu Login).
- `POST /cart/add`: Thêm vào giỏ hàng.
- `POST /orders/checkout`: Tạo đơn hàng mới.
- `GET /orders/success/:orderCode`: Thông tin đơn hàng thành công.

---

## 5. Payments (Thanh toán)
- `POST /payment/create-payment-link`: Tạo link thanh toán qua PayOS.
- `GET /payment/verify-payment`: Xác nhận trạng thái thanh toán.

---

## 6. Others
- `POST /chatbot/query`: Giao tiếp với AI chatbot (Groq).
- `GET /reviews/:bookId`: Xem đánh giá của một cuốn sách.

---

## Quy định chung
- **Header**: Các API yêu cầu xác thực phải gửi kèm `Authorization: Bearer <token>`.
- **Response Format**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": { ... }
  }
  ```
