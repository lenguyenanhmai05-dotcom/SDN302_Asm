# KẾ HOẠCH TRIỂN KHAI ASSIGNMENT 1 (SDN302)
## Ứng dụng Quản lý Task & Team (Task & Team Management App)

**Thư mục dự án:** `SDN302_Asm`  
**GitHub Repository:** `https://github.com/lenguyenanhmai05-dotcom/SDN302_Asm.git`  
**Database:** Cloud PostgreSQL (Supabase)  
**Hosting:** Vercel  

---

### GIAI ĐOẠN 1: KHỞI TẠO DỰ ÁN & KẾT NỐI GITHUB (Đã hoàn thành)
- [x] Đổi tên & định vị đúng thư mục: `SDN302_Asm`
- [x] Khởi tạo dự án Next.js (App Router, TypeScript, Tailwind CSS, ESLint)
- [x] Cài đặt và cấu hình Prettier (`.prettierrc`, `.prettierignore`)
- [x] Khởi tạo Git repository (`git init`)
- [x] Tạo file `.gitignore` và `.env.example`
- [x] Kết nối remote GitHub `https://github.com/lenguyenanhmai05-dotcom/SDN302_Asm.git`
- [x] Commit 1: `chore: initial project setup with next.js, tailwind, eslint and prettier`
- [x] Push commit đầu tiên lên nhánh `main` trên GitHub

---

### GIAI ĐOẠN 2: THIẾT LẬP PRISMA & KẾT NỐI DATABASE SUPABASE (Đã hoàn thành)
- [x] Cài đặt Prisma CLI và `@prisma/client` (v6.4.1 ổn định chuẩn cho môn học)
- [x] Cấu hình `.env` với chuỗi kết nối Supabase (đã mã hóa URL mật khẩu `Lenguyenanhmai0609%3F%21`):
  - `DATABASE_URL`: Transaction pooler (Port 6543)
  - `DIRECT_URL`: Session pooler / Direct (Port 5432)
- [x] Định nghĩa các Data Model trong `prisma/schema.prisma`:
  - `User`: Quản lý người dùng
  - `Team`: Quản lý nhóm
  - `TeamMember`: Bảng liên kết User - Team
  - `Task`: Quản lý công việc
- [x] Chạy migration thành công lên Supabase: `20260927102928_init`
- [x] Tạo module singleton Prisma: `lib/prisma.ts`
- [x] Nạp 5 task mẫu ban đầu qua `prisma/seed.ts`
- [x] Commit 2: `feat(prisma): setup schema models, supabase connection and initial migration`
- [x] Push lên GitHub

---

### GIAI ĐOẠN 3: XÂY DỰNG API ROUTE HANDLERS (Đã hoàn thành)
- [x] `GET /api/tasks`: Lấy danh sách task (hỗ trợ sắp xếp, tìm kiếm và lọc status/priority)
- [x] `POST /api/tasks`: Tạo mới task (kiểm tra title bắt buộc)
- [x] `PUT /api/tasks/[id]`: Cập nhật task (sửa title, description, status, priority, dueDate)
- [x] `DELETE /api/tasks/[id]`: Xóa task an toàn
- [x] Commit 3: `feat(api): implement task crud route handlers with prisma`
- [x] Push lên GitHub

---

### GIAI ĐOẠN 4: XÂY DỰNG GIAO DIỆN NGƯỜI DÙNG THEO BẢNG MÀU JADE (Đã hoàn thành)
- [x] Tích hợp bảng màu Ngọc bích (Jade Green) từ ảnh bạn gửi:
  - `#AEDBB8` (Light soft jade)
  - `#8FCA97` (Fresh leaf jade)
  - `#68A877` (Muted emerald)
  - `#45834D` (Deep forest jade)
- [x] Layout dùng chung (`app/layout.tsx`):
  - Navbar: Logo TaskTeam, Home, Teams (badge Soon), nút Login modal, Supabase status pill
  - Footer: Thông tin Assignment 1, tech stack badges
- [x] Trang Teams (`app/teams/page.tsx`): Giao diện "Coming Soon" với feature preview cards cho Asm 2
- [x] Trang chủ (`app/page.tsx`):
  - Hero Header giới thiệu ứng dụng kèm 4 thẻ thống kê trực tiếp (Tổng, To Do, In Progress, Done)
  - Form tạo Task mới (giao diện đẹp, validate realtime, chọn status/priority/hạn)
  - Danh sách Task trực quan với badge trạng thái màu sắc
  - Quick toggle hoàn thành trực tiếp trên từng card
  - Modal chỉnh sửa Task tiện lợi
  - Modal xác nhận Xóa Task an toàn
  - Tự động cập nhật giao diện ngay sau khi Thêm/Sửa/Xóa (không cần reload trang)
- [x] Commit 4: `feat(ui): responsive layout, jade green theme, task crud page, and teams placeholder`
- [x] Push lên GitHub

---

### GIAI ĐOẠN 5: TÍNH NĂNG ĐIỂM CỘNG (Đã hoàn thành)
- [x] Bộ lọc trạng thái (Tất cả, To Do, In Progress, Done)
- [x] Bộ lọc theo độ ưu tiên (Cao, Vừa, Thấp)
- [x] Thanh tìm kiếm task theo tiêu đề và mô tả
- [x] Client-side validation với thông báo lỗi
- [x] Thông báo Toast feedback hiện đại
- [x] Sơ đồ ERD (Entity Relationship Diagram) Mermaid trong `README.md`
- [x] File CI GitHub Actions (`.github/workflows/ci.yml`) tự động lint & build khi push code
- [x] Commit 5: `feat(bonus): add github actions ci, erd diagram, and enhanced documentation`
- [x] Push lên GitHub

---

### GIAI ĐOẠN 6: DEPLOY VERCEL & TÀI LIỆU NỘP BÀI (Sẵn sàng)
- [ ] Deploy lên Vercel và cấu hình biến môi trường
- [ ] Soạn mẫu tài liệu nộp bài `[MSSV]_Ass1.docx`
