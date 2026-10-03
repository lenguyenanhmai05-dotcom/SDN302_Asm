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
            text: "ASSIGNMENT 2 REPORT",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "Task & Team Management App: CRUD API with Authentication",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Mandatory Submission Information Block (Keep exact labels for automated grading)
          new Paragraph({
            text: "SUBMISSION INFORMATION",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Student ID: ", bold: true }),
              new TextRun("QE123456 (Replace with your Student ID)\n"),
              new TextRun({ text: "Full Name: ", bold: true }),
              new TextRun("Le Nguyen Anh Mai\n"),
              new TextRun({ text: "GitHub Repository URL: ", bold: true }),
              new TextRun("https://github.com/lenguyenanhmai05-dotcom/SDN302_Asm\n"),
              new TextRun({ text: "Deployed Website URL (Vercel): ", bold: true }),
              new TextRun("https://sdn-302-asm-git-main-lenguyenanhmais-projects.vercel.app\n"),
              new TextRun({ text: "Separate Backend URL (NestJS on Render) — write N/A if not used: ", bold: true }),
              new TextRun("N/A\n"),
              new TextRun({ text: "Test Account Email: ", bold: true }),
              new TextRun("grader.sdn302@gmail.com\n"),
              new TextRun({ text: "Test Account Password: ", bold: true }),
              new TextRun("Password123!\n"),
              new TextRun({
                text: "This test account is already email-verified / ready to log in immediately, with no confirmation link needed (Yes / No): ",
                bold: true,
              }),
              new TextRun("Yes\n"),
              new TextRun({
                text: "Self-registration works, so a grader can create their own account (Yes / No): ",
                bold: true,
              }),
              new TextRun("Yes\n"),
            ],
            spacing: { after: 300 },
          }),

          // Section 2: Executive Summary & Tech Stack
          new Paragraph({
            text: "1. Architecture & Tech Stack",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This project extends Assignment 1 into a full-featured collaborative Task & Team Management application (OrPit v2). It runs fullstack on Next.js 16 with Route Handlers and Prisma ORM connected to Supabase PostgreSQL.\n\n",
              }),
              new TextRun({ text: "• Framework: ", bold: true }),
              new TextRun("Next.js 16 (App Router, Route Handlers, TypeScript)\n"),
              new TextRun({ text: "• Database: ", bold: true }),
              new TextRun("PostgreSQL hosted on Supabase (with transaction and direct session poolers)\n"),
              new TextRun({ text: "• ORM: ", bold: true }),
              new TextRun("Prisma ORM (type-safe migrations, relations, and Prisma Client)\n"),
              new TextRun({ text: "• Authentication: ", bold: true }),
              new TextRun("Custom JWT session authentication via jose, bcryptjs password hashing, and secure HTTP-only cookies\n"),
              new TextRun({ text: "• Styling: ", bold: true }),
              new TextRun("Tailwind CSS v4 with custom Red Velvet & Warm Cream luxury aesthetic\n"),
              new TextRun({ text: "• Deployment: ", bold: true }),
              new TextRun("Vercel with CI/CD GitHub Actions\n"),
            ],
            spacing: { after: 200 },
          }),

          // Section 3: RESTful API Endpoints Specification
          new Paragraph({
            text: "2. RESTful API Endpoints Implemented",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            text: "All 15 required API endpoints have been implemented, tested, and validated with role-based authorization:",
            spacing: { after: 150 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Method", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Endpoint", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Authorization", bold: true })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("POST")] }),
                  new TableCell({ children: [new Paragraph("/api/auth/register")] }),
                  new TableCell({ children: [new Paragraph("Register user with name, email, password")] }),
                  new TableCell({ children: [new Paragraph("Public")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("POST")] }),
                  new TableCell({ children: [new Paragraph("/api/auth/login")] }),
                  new TableCell({ children: [new Paragraph("Authenticate user & set HTTP-only JWT cookie")] }),
                  new TableCell({ children: [new Paragraph("Public")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("POST")] }),
                  new TableCell({ children: [new Paragraph("/api/auth/logout")] }),
                  new TableCell({ children: [new Paragraph("Clear authentication cookie & session")] }),
                  new TableCell({ children: [new Paragraph("Authenticated")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("GET")] }),
                  new TableCell({ children: [new Paragraph("/api/auth/me")] }),
                  new TableCell({ children: [new Paragraph("Get currently authenticated user profile")] }),
                  new TableCell({ children: [new Paragraph("Authenticated")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("GET")] }),
                  new TableCell({ children: [new Paragraph("/api/teams")] }),
                  new TableCell({ children: [new Paragraph("List teams the current user belongs to")] }),
                  new TableCell({ children: [new Paragraph("Authenticated")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("POST")] }),
                  new TableCell({ children: [new Paragraph("/api/teams")] }),
                  new TableCell({ children: [new Paragraph("Create new team (creator automatically becomes Owner)")] }),
                  new TableCell({ children: [new Paragraph("Authenticated")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("GET")] }),
                  new TableCell({ children: [new Paragraph("/api/teams/:id")] }),
                  new TableCell({ children: [new Paragraph("Get team details, members list, and tasks")] }),
                  new TableCell({ children: [new Paragraph("Team Member / Owner")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("PUT")] }),
                  new TableCell({ children: [new Paragraph("/api/teams/:id")] }),
                  new TableCell({ children: [new Paragraph("Update team name and description")] }),
                  new TableCell({ children: [new Paragraph("Team Owner only")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("DELETE")] }),
                  new TableCell({ children: [new Paragraph("/api/teams/:id")] }),
                  new TableCell({ children: [new Paragraph("Delete team, cascading to members & tasks")] }),
                  new TableCell({ children: [new Paragraph("Team Owner only")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("POST")] }),
                  new TableCell({ children: [new Paragraph("/api/teams/:id/members")] }),
                  new TableCell({ children: [new Paragraph("Add member to team by email")] }),
                  new TableCell({ children: [new Paragraph("Team Owner only")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("DELETE")] }),
                  new TableCell({ children: [new Paragraph("/api/teams/:id/members/:userId")] }),
                  new TableCell({ children: [new Paragraph("Remove member from team")] }),
                  new TableCell({ children: [new Paragraph("Owner or Self (cannot remove Owner)")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("GET")] }),
                  new TableCell({ children: [new Paragraph("/api/teams/:id/tasks")] }),
                  new TableCell({ children: [new Paragraph("List tasks in team with status/priority/assignee filters")] }),
                  new TableCell({ children: [new Paragraph("Team Member / Owner")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("POST")] }),
                  new TableCell({ children: [new Paragraph("/api/teams/:id/tasks")] }),
                  new TableCell({ children: [new Paragraph("Create task in team with assignee")] }),
                  new TableCell({ children: [new Paragraph("Team Member / Owner")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("PUT")] }),
                  new TableCell({ children: [new Paragraph("/api/tasks/:id")] }),
                  new TableCell({ children: [new Paragraph("Update task status, priority, assignee, details")] }),
                  new TableCell({ children: [new Paragraph("Team Member / Owner")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("DELETE")] }),
                  new TableCell({ children: [new Paragraph("/api/tasks/:id")] }),
                  new TableCell({ children: [new Paragraph("Delete task")] }),
                  new TableCell({ children: [new Paragraph("Creator, Assignee, or Team Owner")] }),
                ],
              }),
            ],
          }),

          // Section 4: Role-Based Authorization
          new Paragraph({
            text: "3. Role-Based Authorization Rules",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 250, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "1. Team Owner Permissions:\n", bold: true }),
              new TextRun("• Full ownership of created teams.\n"),
              new TextRun("• Ability to edit team name and description.\n"),
              new TextRun("• Ability to delete team.\n"),
              new TextRun("• Ability to invite new members by email and assign roles.\n"),
              new TextRun("• Ability to remove members (cannot remove self as owner).\n"),
              new TextRun("• Ability to create, edit, and delete any task within the team.\n\n"),
              new TextRun({ text: "2. Team Member Permissions:\n", bold: true }),
              new TextRun("• View team workspace, members list, and task boards.\n"),
              new TextRun("• Create tasks within the team.\n"),
              new TextRun("• Update task status, priority, and assignees.\n"),
              new TextRun("• Delete tasks if they are the task creator or assigned member.\n"),
              new TextRun("• Cannot edit team details, invite other members, or delete the team.\n\n"),
              new TextRun({ text: "3. Unauthenticated Visitors:\n", bold: true }),
              new TextRun("• Can view the public homepage and login/registration pages.\n"),
              new TextRun("• Attempting to access /teams redirects to /login.\n"),
            ],
            spacing: { after: 200 },
          }),

          // Section 5: Bonus Features
          new Paragraph({
            text: "4. Bonus Features Implemented",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Kanban-Style Interactive Board: ", bold: true }),
              new TextRun("Visual To Do, In Progress, and Done columns with quick-action status cycling.\n"),
              new TextRun({ text: "• Multi-Criteria Search & Filtering: ", bold: true }),
              new TextRun("Filter tasks simultaneously by keyword search, status, priority, and assigned team member.\n"),
              new TextRun({ text: "• Dual Workspace View: ", bold: true }),
              new TextRun("Toggle dynamically between Kanban Board view and compact Data Table list view.\n"),
              new TextRun({ text: "• Grader Quick-Fill Button: ", bold: true }),
              new TextRun("One-click button on login page that automatically populates the test credentials for frictionless grading.\n"),
            ],
            spacing: { after: 200 },
          }),

          // Section 6: Self-Assessment Checklist
          new Paragraph({
            text: "5. Self-Assessment Checklist",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun("✅ User registration with name, email, and password\n"),
              new TextRun("✅ User login and session management via JWT & HTTP-only cookies\n"),
              new TextRun("✅ Logout functionality that revokes session\n"),
              new TextRun("✅ Protected routes: Unauthenticated visitors cannot access teams or tasks\n"),
              new TextRun("✅ Test account provided and ready to log in immediately without email confirmation\n"),
              new TextRun("✅ Self-registration works directly without email verification link\n"),
              new TextRun("✅ Team creation where creator automatically becomes Owner\n"),
              new TextRun("✅ Owner can add members by email and remove members\n"),
              new TextRun("✅ User can belong to multiple teams and switch between workspaces\n"),
              new TextRun("✅ Tasks belong to teams and can be assigned to team members\n"),
              new TextRun("✅ Role-based authorization: Only creator, assignee, or Owner can delete tasks\n"),
              new TextRun("✅ All 15 required RESTful CRUD API endpoints implemented and verified\n"),
              new TextRun("✅ Kanban Board view with status columns\n"),
              new TextRun("✅ Real-time filter and search by status, priority, and assignee\n"),
            ],
            spacing: { after: 200 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(process.cwd(), "SDN302_Assignment2_Report.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log(`Report generated successfully at: ${outputPath}`);
}

generateDocx().catch((err) => {
  console.error("Error generating docx:", err);
});
