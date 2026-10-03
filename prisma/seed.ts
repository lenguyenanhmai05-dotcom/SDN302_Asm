import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for Assignment 2 with Vietnamese team members...");

  // Clean up existing records in order of relations
  await prisma.task.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultHashedPassword = await bcrypt.hash("Password123!", 10);

  // 1. Create Users
  const graderUser = await prisma.user.create({
    data: {
      name: "Alex Rivera (Grader)",
      email: "grader@sdn302.edu.vn",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Grader User: ${graderUser.email}`);

  const anhMaiUser = await prisma.user.create({
    data: {
      name: "AnhMai",
      email: "lenguyenanhmai05@gmail.com",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Student User: ${anhMaiUser.email}`);

  const haBangUser = await prisma.user.create({
    data: {
      name: "HaBang",
      email: "habang@orpit.app",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Team Member: ${haBangUser.name} (${haBangUser.email})`);

  const tamNhuUser = await prisma.user.create({
    data: {
      name: "TamNhu",
      email: "tamnhu@orpit.app",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Team Member: ${tamNhuUser.name} (${tamNhuUser.email})`);

  const nhuHoaUser = await prisma.user.create({
    data: {
      name: "NhuHoa",
      email: "nhuhoa@orpit.app",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Team Member: ${nhuHoaUser.name} (${nhuHoaUser.email})`);

  // 2. Create Teams
  // Team 1: Frontend & UI/UX Design System (Owned by AnhMai)
  const designTeam = await prisma.team.create({
    data: {
      name: "Frontend & UI/UX Design System",
      description: "Modern web application architecture, Red Velvet design system, and responsive component library.",
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

  // Team 2: Fullstack Cloud & DevOps (Owned by AnhMai)
  const devopsTeam = await prisma.team.create({
    data: {
      name: "Fullstack Cloud & DevOps",
      description: "PostgreSQL database migrations on Supabase, Vercel deployments, and CI/CD pipelines.",
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

  // Team 3: Core Engineering Team (Owned by Alex Rivera)
  const engTeam = await prisma.team.create({
    data: {
      name: "Core Engineering Team",
      description: "Frontend architecture, API integrations, and continuous cloud deployments.",
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

  // Team 4: Mobile & Product Launch (Owned by HaBang)
  const mobileTeam = await prisma.team.create({
    data: {
      name: "Mobile & Product Launch",
      description: "Preparing iOS and Android releases, landing pages, and QA testing.",
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
      title: "Refactor navigation and header components",
      description: "Streamlined brand logo, removed legacy badges, and optimized layout spacing.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      teamId: designTeam.id,
      assigneeId: anhMaiUser.id,
      creatorId: anhMaiUser.id,
    },
    {
      title: "Implement responsive Kanban board with quick status cycling",
      description: "Organized tasks across To Do, In Progress, and Done columns with real-time UI feedback.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      teamId: designTeam.id,
      assigneeId: haBangUser.id,
      creatorId: anhMaiUser.id,
    },
    {
      title: "Audit accessibility (a11y) & WCAG contrast compliance",
      description: "Ensure high-contrast palette and readable typography on mobile and desktop screens.",
      status: "TO_DO",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      teamId: designTeam.id,
      assigneeId: tamNhuUser.id,
      creatorId: anhMaiUser.id,
    },
    {
      title: "Prepare Assignment 2 video walkthrough and demo",
      description: "Record step-by-step showcase of team creation, member invitation, and task management.",
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

  // 4. Create Tasks for DevOps Team
  const devopsTasks = [
    {
      title: "Configure Supabase connection pooling and migrations",
      description: "Verified transaction pooler on port 6543 and direct session pooler on port 5432.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      teamId: devopsTeam.id,
      assigneeId: tamNhuUser.id,
      creatorId: anhMaiUser.id,
    },
    {
      title: "Automated smoke tests for RESTful API routes",
      description: "Validate all 15 endpoints covering auth, teams, members, and tasks.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      teamId: devopsTeam.id,
      assigneeId: anhMaiUser.id,
      creatorId: anhMaiUser.id,
    },
    {
      title: "Set up environment variables and staging branches on Vercel",
      description: "Configure DATABASE_URL and JWT_SECRET on Vercel deployment console.",
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
      title: "Set up JWT authentication & HTTP-only session cookies",
      description: "Implemented custom JWT auth with bcryptjs and secure HTTP-only cookies.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      teamId: engTeam.id,
      assigneeId: graderUser.id,
      creatorId: graderUser.id,
    },
    {
      title: "Build Kanban Board with drag-and-drop & status cycle",
      description: "Interactive board view supporting To Do, In Progress, and Done columns with real-time updates.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      teamId: engTeam.id,
      assigneeId: haBangUser.id,
      creatorId: graderUser.id,
    },
    {
      title: "Implement member invitation by email & role checking",
      description: "Add members to workspace and enforce Owner-only permissions on team configuration.",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      teamId: engTeam.id,
      assigneeId: tamNhuUser.id,
      creatorId: graderUser.id,
    },
    {
      title: "Deploy Vercel project with Supabase cloud connection pooling",
      description: "Verify production database connectivity and automated deployment triggers.",
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

  // 6. Create Sample Tasks for Mobile & Product Launch Team
  const mobileTasks = [
    {
      title: "Design mobile-first responsive dashboard layout",
      description: "Optimized viewport for mobile tablets and desktop widths.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      teamId: mobileTeam.id,
      assigneeId: haBangUser.id,
      creatorId: haBangUser.id,
    },
    {
      title: "Run automated end-to-end smoke tests on CRUD endpoints",
      description: "Check GET, POST, PUT, DELETE operations for teams, members, and tasks.",
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
      title: "Welcome to OrPit Workspace System",
      description: "Public task demonstration. Log in to access multi-team workspaces and task assignments.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      creatorId: graderUser.id,
    },
    {
      title: "Explore Team Collaboration Features",
      description: "Sign in with the test account or create your own account to experience full team workspaces.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      creatorId: graderUser.id,
    },
  ];

  for (const t of publicTasks) {
    await prisma.task.create({ data: t });
  }

  console.log("✅ Seed completed successfully with HaBang, TamNhu, NhuHoa!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
