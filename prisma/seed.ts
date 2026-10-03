import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for Assignment 2...");

  // Clean up existing records in order of relations
  await prisma.task.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultHashedPassword = await bcrypt.hash("Password123!", 10);

  // 1. Create Test Account for Grader & Sample Users
  const graderUser = await prisma.user.create({
    data: {
      name: "Alex Rivera (Grader)",
      email: "grader@sdn302.edu.vn",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Grader User: ${graderUser.email}`);

  const sarahUser = await prisma.user.create({
    data: {
      name: "Sarah Connor",
      email: "sarah.dev@orpit.app",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Sample User: ${sarahUser.email}`);

  const johnUser = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.lead@orpit.app",
      password: defaultHashedPassword,
    },
  });
  console.log(`Created Sample User: ${johnUser.email}`);

  // 2. Create Teams
  // Team 1: Core Engineering Team (Owned by Alex Rivera)
  const engTeam = await prisma.team.create({
    data: {
      name: "Core Engineering Team",
      description: "Frontend architecture, API integrations, and continuous cloud deployments.",
      ownerId: graderUser.id,
      members: {
        create: [
          { userId: graderUser.id, role: "OWNER" },
          { userId: sarahUser.id, role: "MEMBER" },
          { userId: johnUser.id, role: "MEMBER" },
        ],
      },
    },
  });
  console.log(`Created Team: ${engTeam.name}`);

  // Team 2: Mobile App Launch (Owned by Sarah Connor)
  const mobileTeam = await prisma.team.create({
    data: {
      name: "Mobile & Product Launch",
      description: "Preparing iOS and Android releases, landing pages, and QA testing.",
      ownerId: sarahUser.id,
      members: {
        create: [
          { userId: sarahUser.id, role: "OWNER" },
          { userId: graderUser.id, role: "MEMBER" },
        ],
      },
    },
  });
  console.log(`Created Team: ${mobileTeam.name}`);

  // 3. Create Sample Tasks for Core Engineering Team
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
      assigneeId: sarahUser.id,
      creatorId: graderUser.id,
    },
    {
      title: "Implement member invitation by email & role checking",
      description: "Add members to workspace and enforce Owner-only permissions on team configuration.",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      teamId: engTeam.id,
      assigneeId: johnUser.id,
      creatorId: graderUser.id,
    },
    {
      title: "Deploy Vercel project with Supabase cloud connection pooling",
      description: "Verify production database connectivity and automated deployment triggers.",
      status: "TO_DO",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      teamId: engTeam.id,
      assigneeId: null,
      creatorId: graderUser.id,
    },
  ];

  for (const t of engTasks) {
    await prisma.task.create({ data: t });
  }

  // 4. Create Sample Tasks for Mobile & Product Launch Team
  const mobileTasks = [
    {
      title: "Design mobile-first responsive dashboard layout",
      description: "Optimized viewport for mobile tablets and desktop widths.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      teamId: mobileTeam.id,
      assigneeId: sarahUser.id,
      creatorId: sarahUser.id,
    },
    {
      title: "Run automated end-to-end smoke tests on CRUD endpoints",
      description: "Check GET, POST, PUT, DELETE operations for teams, members, and tasks.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      teamId: mobileTeam.id,
      assigneeId: graderUser.id,
      creatorId: sarahUser.id,
    },
    {
      title: "Prepare Assignment 2 report documentation",
      description: "Complete submission checklist, test accounts, and architecture overview.",
      status: "TO_DO",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      teamId: mobileTeam.id,
      assigneeId: graderUser.id,
      creatorId: sarahUser.id,
    },
  ];

  for (const t of mobileTasks) {
    await prisma.task.create({ data: t });
  }

  // 5. Create a couple of public homepage tasks
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

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
