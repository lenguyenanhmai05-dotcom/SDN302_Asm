import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for Assignment 2 with 100% Vietnamese names and @gmail.com emails...");

  // Clean up existing records in order of relations
  await prisma.task.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultHashedPassword = await bcrypt.hash("Password123!", 10);

  // 1. Create Users (All Vietnamese names and @gmail.com)
  const graderUser = await prisma.user.create({
    data: {
      name: "GiangVien (Grader)",
      email: "grader.sdn302@gmail.com",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Grader User: ${graderUser.name} (${graderUser.email})`);

  const anhMaiUser = await prisma.user.create({
    data: {
      name: "AnhMai",
      email: "lenguyenanhmai05@gmail.com",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Student User: ${anhMaiUser.name} (${anhMaiUser.email})`);

  const haBangUser = await prisma.user.create({
    data: {
      name: "HaBang",
      email: "habang.dev@gmail.com",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Team Member: ${haBangUser.name} (${haBangUser.email})`);

  const tamNhuUser = await prisma.user.create({
    data: {
      name: "TamNhu",
      email: "tamnhu.dev@gmail.com",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Team Member: ${tamNhuUser.name} (${tamNhuUser.email})`);

  const nhuHoaUser = await prisma.user.create({
    data: {
      name: "NhuHoa",
      email: "nhuhoa.dev@gmail.com",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Team Member: ${nhuHoaUser.name} (${nhuHoaUser.email})`);

  // 2. Create Teams
  // Team 1: Nhóm Thiết Kế Giao Diện UI/UX (Owned by AnhMai)
  const designTeam = await prisma.team.create({
    data: {
      name: "Nhóm Thiết Kế Giao Diện UI/UX",
      description: "Phát triển kiến trúc giao diện web hiện đại, hệ thống thiết kế Red Velvet và thư viện component trực quan.",
      ownerId: anhMaiUser.id,
      members: {
        create: [
          { userId: anhMaiUser.id, role: "OWNER" },
          { userId: haBangUser.id, role: "MEMBER" },
          { userId: tamNhuUser.id, role: "MEMBER" },
          { userId: nhuHoaUser.id, role: "MEMBER" },
          { userId: graderUser.id, role: "MEMBER" },
        ],
      },
    },
  });
  console.log(`Created Team: ${designTeam.name}`);

  // Team 2: Nhóm Phát Triển Hệ Thống Cloud & DevOps (Owned by AnhMai)
  const devopsTeam = await prisma.team.create({
    data: {
      name: "Nhóm Phát Triển Cloud & DevOps",
      description: "Quản lý cơ sở dữ liệu PostgreSQL Supabase, triển khai tự động Vercel và xây dựng đường ống CI/CD.",
      ownerId: anhMaiUser.id,
      members: {
        create: [
          { userId: anhMaiUser.id, role: "OWNER" },
          { userId: tamNhuUser.id, role: "MEMBER" },
          { userId: haBangUser.id, role: "MEMBER" },
          { userId: nhuHoaUser.id, role: "MEMBER" },
          { userId: graderUser.id, role: "MEMBER" },
        ],
      },
    },
  });
  console.log(`Created Team: ${devopsTeam.name}`);

  // Team 3: Đội Ngũ Kỹ Thuật Lõi (Core Engineering) (Owned by GiangVien)
  const engTeam = await prisma.team.create({
    data: {
      name: "Đội Ngũ Kỹ Thuật Lõi (Core Engineering)",
      description: "Xây dựng các module bảo mật, xác thực người dùng JWT và Route Handlers hệ thống.",
      ownerId: graderUser.id,
      members: {
        create: [
          { userId: graderUser.id, role: "OWNER" },
          { userId: anhMaiUser.id, role: "MEMBER" },
          { userId: haBangUser.id, role: "MEMBER" },
          { userId: tamNhuUser.id, role: "MEMBER" },
        ],
      },
    },
  });
  console.log(`Created Team: ${engTeam.name}`);

  // Team 4: Dự Án Ứng Dụng Di Động (Mobile App) (Owned by HaBang)
  const mobileTeam = await prisma.team.create({
    data: {
      name: "Dự Án Ứng Dụng Di Động (Mobile App)",
      description: "Thiết kế trải nghiệm người dùng trên thiết bị di động, tối ưu hiệu năng và kiểm thử QA.",
      ownerId: haBangUser.id,
      members: {
        create: [
          { userId: haBangUser.id, role: "OWNER" },
          { userId: anhMaiUser.id, role: "MEMBER" },
          { userId: nhuHoaUser.id, role: "MEMBER" },
          { userId: graderUser.id, role: "MEMBER" },
        ],
      },
    },
  });
  console.log(`Created Team: ${mobileTeam.name}`);

  // 3. Create Tasks for Design Team (AnhMai's Team)
  const designTasks = [
    {
      title: "Thiết kế và hoàn thiện thanh điều hướng giao diện",
      description: "Tối giản logo thương hiệu, sắp xếp các menu tiện ích và bố cục không gian hiển thị.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      teamId: designTeam.id,
      assigneeId: anhMaiUser.id,
      creatorId: anhMaiUser.id,
    },
    {
      title: "Xây dựng bảng Kanban kéo thả và đổi trạng thái nhanh",
      description: "Phân chia công việc theo 3 cột Cần làm, Đang làm và Hoàn thành kèm cập nhật tức thời.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      teamId: designTeam.id,
      assigneeId: haBangUser.id,
      creatorId: anhMaiUser.id,
    },
    {
      title: "Kiểm tra độ tương phản màu sắc và khả năng truy cập (a11y)",
      description: "Đảm bảo bảng màu tương phản cao, phông chữ hiển thị rõ nét trên cả máy tính và điện thoại.",
      status: "TO_DO",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      teamId: designTeam.id,
      assigneeId: tamNhuUser.id,
      creatorId: anhMaiUser.id,
    },
    {
      title: "Chuẩn bị tài liệu và video báo cáo Assignment 2",
      description: "Ghi lại quy trình tạo team, mời thành viên qua email và quản lý công việc trên nhóm.",
      status: "TO_DO",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      teamId: designTeam.id,
      assigneeId: nhuHoaUser.id,
      creatorId: anhMaiUser.id,
    },
  ];

  for (const t of designTasks) {
    await prisma.task.create({ data: t });
  }

  // 4. Create Tasks for DevOps Team (AnhMai's Team)
  const devopsTasks = [
    {
      title: "Cấu hình kết nối Supabase và biến môi trường Vercel",
      description: "Kiểm tra kết nối pooling cổng 6543 và direct session cổng 5432 trên nền tảng Supabase.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      teamId: devopsTeam.id,
      assigneeId: tamNhuUser.id,
      creatorId: anhMaiUser.id,
    },
    {
      title: "Kiểm thử tự động 15 endpoint API RESTful",
      description: "Kiểm tra tất cả chức năng xác thực, phân quyền nhóm và quản lý task tự động.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      teamId: devopsTeam.id,
      assigneeId: anhMaiUser.id,
      creatorId: anhMaiUser.id,
    },
    {
      title: "Tối ưu hóa tốc độ tải trang và caching dữ liệu",
      description: "Áp dụng cơ chế render linh hoạt và tinh giản gói bundle xuất bản.",
      status: "TO_DO",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      teamId: devopsTeam.id,
      assigneeId: graderUser.id,
      creatorId: anhMaiUser.id,
    },
  ];

  for (const t of devopsTasks) {
    await prisma.task.create({ data: t });
  }

  // 5. Create Sample Tasks for Core Engineering Team
  const engTasks = [
    {
      title: "Thiết lập hệ thống xác thực JWT và cookie HTTP-only",
      description: "Sử dụng thư viện jose chuẩn hóa và mã hóa mật khẩu bảo mật bằng bcryptjs.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      teamId: engTeam.id,
      assigneeId: graderUser.id,
      creatorId: graderUser.id,
    },
    {
      title: "Phân quyền vai trò Trưởng nhóm (Owner) và Thành viên (Member)",
      description: "Kiểm tra quyền hạn sửa, xóa nhóm và quyền xóa công việc theo đúng quy tắc.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      teamId: engTeam.id,
      assigneeId: haBangUser.id,
      creatorId: graderUser.id,
    },
    {
      title: "Xây dựng tính năng mời thành viên bằng email",
      description: "Thêm thành viên vào nhóm qua địa chỉ email có kiểm tra trùng lặp.",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      teamId: engTeam.id,
      assigneeId: tamNhuUser.id,
      creatorId: graderUser.id,
    },
    {
      title: "Triển khai ứng dụng hoàn chỉnh lên dịch vụ đám mây Vercel",
      description: "Xác nhận website hoạt động trực tiếp ổn định và kết nối thông suốt với Supabase.",
      status: "TO_DO",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      teamId: engTeam.id,
      assigneeId: anhMaiUser.id,
      creatorId: graderUser.id,
    },
  ];

  for (const t of engTasks) {
    await prisma.task.create({ data: t });
  }

  // 6. Create Sample Tasks for Mobile Team
  const mobileTasks = [
    {
      title: "Tối ưu hóa giao diện thân thiện trên điện thoại và máy tính bảng",
      description: "Kiểm tra tính tương thích trên nhiều kích cỡ màn hình khác nhau.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      teamId: mobileTeam.id,
      assigneeId: haBangUser.id,
      creatorId: haBangUser.id,
    },
    {
      title: "Kiểm thử trải nghiệm người dùng và hoàn thiện tài liệu nộp bài",
      description: "Rà soát toàn bộ các tiêu chí chấm điểm và xuất bản file báo cáo Word.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      teamId: mobileTeam.id,
      assigneeId: anhMaiUser.id,
      creatorId: haBangUser.id,
    },
  ];

  for (const t of mobileTasks) {
    await prisma.task.create({ data: t });
  }

  // 7. Create a couple of public homepage tasks
  const publicTasks = [
    {
      title: "Chào mừng đến với hệ thống quản lý công việc OrPit",
      description: "Hệ thống quản lý công việc và không gian làm việc nhóm trực tuyến.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      creatorId: anhMaiUser.id,
    },
    {
      title: "Khám phá tính năng cộng tác nhóm và phân công công việc",
      description: "Đăng nhập tài khoản để trải nghiệm toàn bộ các tính năng không gian nhóm và bảng Kanban.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      creatorId: anhMaiUser.id,
    },
  ];

  for (const t of publicTasks) {
    await prisma.task.create({ data: t });
  }

  console.log("✅ Seed completed successfully with 100% Vietnamese names and @gmail.com!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
