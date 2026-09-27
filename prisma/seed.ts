import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing demo tasks if any
  await prisma.task.deleteMany({});

  const sampleTasks = [
    {
      title: "Initialize Next.js project & clean folder structure",
      description: "Setup App Router, TypeScript, Tailwind CSS, ESLint and Prettier.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
    },
    {
      title: "Configure Prisma ORM with Supabase PostgreSQL",
      description: "Define User, Team, TeamMember, and Task models with initial migration.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Implement Task CRUD Route Handlers",
      description: "Build GET, POST, PUT, DELETE endpoints for public task management.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Design Responsive Homepage & Task Management UI",
      description: "Create shared layout, task list cards, creation form, edit and delete dialogs.",
      status: "TO_DO",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Deploy live application to Vercel",
      description: "Connect GitHub repo to Vercel and configure cloud environment variables.",
      status: "TO_DO",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const task of sampleTasks) {
    const created = await prisma.task.create({
      data: task,
    });
    console.log(`Created task: ${created.title}`);
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
