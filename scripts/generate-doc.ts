import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";
import * as fs from "fs";
import * as path from "path";

async function generateDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "ASSIGNMENT 1 REPORT",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "Task & Team Management Web Application: Project Setup, Prisma & Deployment",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Student Info Box
          new Paragraph({
            children: [
              new TextRun({ text: "Course: ", bold: true }),
              new TextRun("SDN302 – Software Development with Node.js & Cloud Database\n"),
              new TextRun({ text: "Student Name: ", bold: true }),
              new TextRun("Lê Nguyễn Ánh Mai\n"),
              new TextRun({ text: "Student ID: ", bold: true }),
              new TextRun("[Điền mã số sinh viên của bạn tại đây, ví dụ: QE123456]\n"),
              new TextRun({ text: "Submission Date: ", bold: true }),
              new TextRun(new Date().toLocaleDateString("vi-VN")),
            ],
            spacing: { after: 400 },
          }),

          // Section 1: Deliverables Links
          new Paragraph({
            text: "1. Deliverable Links",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Public GitHub Repository: ", bold: true }),
              new TextRun("https://github.com/lenguyenanhmai05-dotcom/SDN302_Asm"),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Live Deployed Website (Vercel): ", bold: true }),
              new TextRun("[Dán link Vercel của bạn vào đây sau khi Deploy, ví dụ: https://sdn302-asm.vercel.app]"),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Public Task CRUD: ", bold: true }),
              new TextRun("Người chấm có thể trực tiếp thêm, xem, cập nhật trạng thái và xóa task mà không cần đăng nhập."),
            ],
            spacing: { after: 300 },
          }),

          // Section 2: Git Commit History
          new Paragraph({
            text: "2. Git & GitHub Commit History (At least 5 meaningful commits)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            text: "Dự án được thực hiện và đẩy lên GitHub với lịch sử commit bài bản theo chuẩn Conventional Commits:",
            spacing: { after: 150 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "No.", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Commit Hash", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Commit Message", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("1")] }),
                  new TableCell({ children: [new Paragraph("2fd6126")] }),
                  new TableCell({ children: [new Paragraph("chore: initial project setup with next.js, tailwind, eslint and prettier")] }),
                  new TableCell({ children: [new Paragraph("Khởi tạo App Router, TypeScript, Tailwind, ESLint, Prettier, .env.example")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("2")] }),
                  new TableCell({ children: [new Paragraph("1460adc")] }),
                  new TableCell({ children: [new Paragraph("feat(prisma): setup schema models, supabase connection and initial migration")] }),
                  new TableCell({ children: [new Paragraph("Tạo 4 models (User, Team, TeamMember, Task) và chạy migration init lên Supabase")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("3")] }),
                  new TableCell({ children: [new Paragraph("5a0f055")] }),
                  new TableCell({ children: [new Paragraph("feat(api): implement task crud route handlers with prisma")] }),
                  new TableCell({ children: [new Paragraph("Xây dựng 4 endpoints GET, POST, PUT, DELETE /api/tasks kết nối Prisma")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("4")] }),
                  new TableCell({ children: [new Paragraph("c1cc387")] }),
                  new TableCell({ children: [new Paragraph("feat(ui): responsive layout, jade green theme, task crud page, and teams placeholder")] }),
                  new TableCell({ children: [new Paragraph("Giao diện trang chủ CRUD, bảng màu Ngọc bích (Jade), trang Teams Coming Soon")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("5")] }),
                  new TableCell({ children: [new Paragraph("144b4e3")] }),
                  new TableCell({ children: [new Paragraph("feat(bonus): add github actions ci, erd diagram, and enhanced documentation")] }),
                  new TableCell({ children: [new Paragraph("Tích hợp GitHub Actions CI, vẽ sơ đồ ERD, bổ sung tài liệu và bộ lọc status/search")] }),
                ],
              }),
            ],
          }),

          // Section 3: Database & Prisma Architecture
          new Paragraph({
            text: "3. Prisma Schema & Cloud Database (Supabase PostgreSQL)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Database Provider: ", bold: true }),
              new TextRun("Cloud PostgreSQL hosted on Supabase (Tokyo region aws-0-ap-northeast-1).\n"),
              new TextRun({ text: "Connection Architecture: ", bold: true }),
              new TextRun(
                "Sử dụng Prisma ORM với 2 chuỗi kết nối: DATABASE_URL (Transaction-mode Pooler qua cổng 6543) cho ứng dụng Next.js trên serverless và DIRECT_URL (Session-mode Pooler qua cổng 5432) cho lệnh Prisma Migrate."
              ),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            text: "Các bảng dữ liệu được tạo trong Supabase:",
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "1. users: ", bold: true }),
              new TextRun("Lưu trữ thông tin người dùng (id, name, email, password, createdAt).\n"),
              new TextRun({ text: "2. teams: ", bold: true }),
              new TextRun("Lưu trữ các nhóm làm việc (id, name, description, ownerId, createdAt).\n"),
              new TextRun({ text: "3. team_members: ", bold: true }),
              new TextRun("Bảng liên kết quan hệ nhiều - nhiều giữa users và teams, kèm vai trò (role: MEMBER, ADMIN).\n"),
              new TextRun({ text: "4. tasks: ", bold: true }),
              new TextRun("Lưu trữ công việc (id, title, description, status, priority, dueDate, teamId, assigneeId, createdAt, updatedAt). Trong Assignment 1, trường teamId và assigneeId được để tùy chọn (optional) để hỗ trợ CRUD công khai."),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "[DÁN ẢNH CHỤP MÀN HÌNH BẢNG TABLE EDITOR TRÊN SUPABASE VÀO ĐÂY]",
                bold: true,
                color: "2E7D32",
              }),
            ],
            spacing: { after: 300 },
          }),

          // Section 4: Features Implemented & Bonus
          new Paragraph({
            text: "4. Features & Bonus Highlights",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Giao diện chuẩn mực & Responsive: ", bold: true }),
              new TextRun("Sử dụng bảng màu Ngọc bích (Jade Green) tinh tế (#AEDBB8, #8FCA97, #68A877, #45834D), hỗ trợ mượt mà trên cả desktop và mobile.\n"),
              new TextRun({ text: "• Public Task CRUD: ", bold: true }),
              new TextRun("Tạo mới, xem danh sách, cập nhật thông tin và xóa task trực tiếp. Dữ liệu cập nhật ngay lập tức mà không cần F5 reload trang.\n"),
              new TextRun({ text: "• Trang Teams Placeholder: ", bold: true }),
              new TextRun("Trang /teams giới thiệu các tính năng sắp phát triển trong Assignment 2.\n"),
              new TextRun({ text: "• Bonus - Client-side Validation: ", bold: true }),
              new TextRun("Kiểm tra bắt buộc nhập tiêu đề task kèm thông báo trực quan.\n"),
              new TextRun({ text: "• Bonus - Status & Priority Filter + Search: ", bold: true }),
              new TextRun("Lọc nhanh task theo trạng thái (All, To Do, In Progress, Done), độ ưu tiên và tìm kiếm từ khóa.\n"),
              new TextRun({ text: "• Bonus - Automated CI Workflow: ", bold: true }),
              new TextRun("GitHub Actions tự động chạy lint và build kiểm tra chất lượng code trên mỗi lần push.\n"),
              new TextRun({ text: "• Bonus - ERD Diagram: ", bold: true }),
              new TextRun("Sơ đồ quan hệ thực thể trực quan bằng Mermaid trong README.md."),
            ],
            spacing: { after: 300 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "[DÁN ẢNH CHỤP MÀN HÌNH GIAO DIỆN TRANG CHỦ HOẶC LINK VERCEL VÀO ĐÂY]",
                bold: true,
                color: "2E7D32",
              }),
            ],
            spacing: { after: 200 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(process.cwd(), "SDN302_Assignment1_Report.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document created successfully at: ${outputPath}`);
}

generateDocx().catch(console.error);
