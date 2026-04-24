# Book Hive - Nền Tảng Thương Mại Điện Tử Sách

Dự án **Book Hive** là một ứng dụng Web App hiện đại dành cho việc mua sắm và quản lý sách, được xây dựng với mục tiêu mang lại trải nghiệm mượt mà cho cả người dùng cuối và quản trị viên.

## 🚀 Demo Trực Tuyến
- **Trang Khách hàng (Client):** [https://book-hive-project.vercel.app/home](https://book-hive-project.vercel.app/home)
- **Trang Quản trị (Admin):** [https://book-hive-project.vercel.app/auth/admin/login](https://book-hive-project.vercel.app/auth/admin/login)

---

## 📚 Tài Liệu Dự Án
Các tài liệu kỹ thuật chi tiết có thể được tìm thấy trong thư mục `/docs`:
- [Sơ đồ thực thể quan hệ (ERD)](docs/ERD.md)
- [Tài liệu API Specification](docs/API_spec.md)
- [Kiến trúc hệ thống](docs/Architecture.md)
- [Báo cáo tiến độ (6 Sprints)](docs/sprints/)

---

## 🛠 Công Nghệ Sử Dụng (Tech Stack)
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Redux Toolkit, React Query.
- **Backend:** Node.js, Express, TypeScript, JWT.
- **Database:** MongoDB (Mongoose).
- **Media:** Cloudinary.
- **Thanh toán:** PayOS.
- **AI:** Groq AI Cloud.

---

## ⚙️ Hướng Dẫn Cài Đặt Local

### 1. Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB (Local hoặc Atlas)

### 2. Cấu hình biến môi trường
Dựa vào các file `.env.example`, hãy tạo file `.env` tương ứng:

**Backend:**
```bash
cd backend
cp .env.example .env
# Chỉnh sửa .env với thông tin cơ sở dữ liệu và API key của bạn
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
# Chỉnh sửa .env.local với thông tin API URL
```

### 3. Chạy ứng dụng

**Chạy Backend:**
```bash
cd backend
npm install
npm run dev
```

**Chạy Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Ứng dụng sẽ khả dụng tại:
- Frontend: `http://localhost:3000/home`
- Backend: `http://localhost:3001/admin/dashboard/login`

---

## 👥 Thông Tin Sinh Viên
- **Họ và tên:** Lương Việt Thái
- **Mã số sinh viên:** 23631761
- **Lớp:** DHKTPM19B
- **Repo:** [https://github.com/thaigithurb/book-hive-project](https://github.com/thaigithurb/book-hive-project)
