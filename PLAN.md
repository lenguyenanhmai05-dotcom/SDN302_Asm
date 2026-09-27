# KẾ HOẠCH TRIỂN KHAI ASSIGNMENT 1 (SDN302)
## Ứng dụng Quản lý Task & Team (Task & Team Management App)

**Thư mục dự án:** `SDN302_Asm`  
**GitHub Repository:** `https://github.com/lenguyenanhmai05-dotcom/SDN302_Asm.git`  
**Database:** Cloud PostgreSQL (Supabase)  
**Hosting:** Vercel  

---

### GIAI ĐOẠN 1: KHỞI TẠO DỰ ÁN & KẾT NỐI GITHUB (Đang thực hiện)
- [x] Đổi tên & định vị đúng thư mục: `SDN302_Asm`
- [ ] Khởi tạo dự án Next.js (App Router, TypeScript, Tailwind CSS, ESLint)
- [ ] Cài đặt và cấu hình Prettier (`.prettierrc`, `.prettierignore`)
- [ ] Khởi tạo Git repository (`git init`)
- [ ] Tạo file `.gitignore` và `.env.example`
- [ ] Kết nối remote GitHub `https://github.com/lenguyenanhmai05-dotcom/SDN302_Asm.git`
- [ ] Commit 1: `chore: initial project setup with next.js, tailwind, eslint and prettier`
- [ ] Push commit đầu tiên lên nhánh `main` trên GitHub

---

### GIAI ĐOẠN 2: THIẾT LẬP PRISMA & KẾT NỐI DATABASE SUPABASE (Đang thực hiện)
- [ ] Cài đặt Prisma CLI và `@prisma/client`
- [ ] Khởi tạo Prisma (`npx prisma init`)
- [ ] Cấu hình `.env` với chuỗi kết nối Supabase:
  - `DATABASE_URL`: Transaction pooler (Port 6543)
  - `DIRECT_URL`: Session pooler / Direct (Port 5432)
- [ ] Định nghĩa các Data Model trong `prisma/schema.prisma`:
  - `User`: Quản lý người dùng (id, name, email, password, createdAt)
  - `Team`: Quản lý nhóm (id, name, description, ownerId, createdAt)
  - `TeamMember`: Bảng liên kết User - Team (id, teamId, userId, role, joinedAt)
  - `Task`: Quản lý công việc (id, title, description, status, priority, dueDate, teamId?, assigneeId?, createdAt)
- [ ] Chạy migration đầu tiên lên Supabase: `npx prisma migrate dev --name init`
- [ ] Tạo module kết nối Singleton Prisma: `lib/prisma.ts`
- [ ] Viết script kiểm tra kết nối trực tiếp đến Supabase
- [ ] Commit 2: `feat(prisma): setup prisma schema models and initial migration for supabase`
- [ ] Push lên GitHub
- [ ] **DỪNG LẠI THÔNG BÁO CHO BẠN THEO YÊU CẦU** (Báo cáo kết nối GitHub + Supabase thành công trước khi sang Giai đoạn 3)

---

### GIAI ĐOẠN 3: XÂY DỰNG API ROUTE HANDLERS (CRUD TASKS)
- [ ] `GET /api/tasks`: Lấy danh sách task (hỗ trợ sắp xếp và lọc theo trạng thái)
- [ ] `POST /api/tasks`: Tạo mới task (kiểm tra title hợp lệ)
- [ ] `PUT /api/tasks/[id]`: Cập nhật task (sửa title, description, status, priority, dueDate)
- [ ] `DELETE /api/tasks/[id]`: Xóa task
- [ ] Commit 3: `feat(api): implement task crud route handlers with prisma`
- [ ] Push lên GitHub

---

### GIAI ĐOẠN 4: XÂY DỰNG GIAO DIỆN NGƯỜI DÙNG (FRONTEND UI/UX)
- [ ] Layout dùng chung (`app/layout.tsx`):
  - Navbar: Logo, Home, Teams, Login (placeholder cho Asm 2)
  - Footer hiện đại, chuyên nghiệp
- [ ] Trang Teams (`app/teams/page.tsx`): Giao diện "Coming Soon" đẹp mắt chuẩn bị cho Asm 2
- [ ] Trang chủ (`app/page.tsx`):
  - Hero Header giới thiệu ứng dụng
  - Form tạo Task mới (giao diện đẹp, validate realtime)
  - Danh sách Task trực quan với badge trạng thái (To Do, In Progress, Done) & độ ưu tiên (Low, Medium, High)
  - Modal / Form chỉnh sửa Task
  - Nút Xóa Task kèm hộp thoại xác nhận
  - Tự động cập nhật giao diện ngay sau khi Thêm/Sửa/Xóa (không cần reload trang)
- [ ] Commit 4: `feat(ui): build responsive layout, task crud page, and teams placeholder`
- [ ] Push lên GitHub

---

### GIAI ĐOẠN 5: TÍNH NĂNG ĐIỂM CỘNG (BONUS FEATURES)
- [ ] Bộ lọc trạng thái (All, To Do, In Progress, Done) và bộ lọc Priority
- [ ] Thanh tìm kiếm task theo tiêu đề/mô tả
- [ ] Client-side validation với thông báo lỗi / Toast trực quan
- [ ] Sơ đồ ERD (Entity Relationship Diagram) trực quan trong `README.md`
- [ ] File CI GitHub Actions (`.github/workflows/ci.yml`) tự động lint & build khi push code
- [ ] Commit 5: `feat(bonus): add task filtering, validation, erd diagram, and github actions ci`
- [ ] Push lên GitHub

---

### GIAI ĐOẠN 6: DEPLOY VERCEL & TÀI LIỆU NỘP BÀI
- [ ] Hướng dẫn liên kết GitHub repo lên Vercel
- [ ] Cấu hình biến môi trường (`DATABASE_URL`, `DIRECT_URL`) trên Vercel Project Settings
- [ ] Kiểm tra toàn diện trên URL Vercel live
- [ ] Tạo file tài liệu mẫu nộp bài `[MSSV]_Ass1.docx`
